import "server-only";
import { prisma } from "../prisma";
import { getDummyHash, verifyPassword } from "./password";
import { createSession } from "./session";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const GENERIC_ERROR = "Wrong email or password.";

export type LoginResult = { ok: true } | { ok: false; error: string };

async function lockedMessage(userId: bigint): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { lockedUntil: true } });
  const ms = user?.lockedUntil ? user.lockedUntil.getTime() - Date.now() : 0;
  return `Too many failed attempts. Try again in ${Math.max(1, Math.ceil(ms / 60000))} min.`;
}

/**
 * Atomically claims one password attempt BEFORE the (slow) password check, so
 * parallel requests can't slip past the lockout: Postgres serializes these
 * updates on the row, and the claim that reaches the limit sets the lock right
 * away. Returns the attempt number, or null if the account is locked.
 */
async function claimAttempt(userId: bigint): Promise<number | null> {
  const rows = await prisma.$queryRaw<{ failedLoginCount: number }[]>`
    UPDATE "User"
    SET
      "failedLoginCount" = CASE
        WHEN "lockedUntil" IS NOT NULL AND "lockedUntil" <= now() THEN 1 -- lock expired: new window
        ELSE "failedLoginCount" + 1
      END,
      "lockedUntil" = CASE
        WHEN "lockedUntil" IS NOT NULL AND "lockedUntil" <= now() THEN NULL
        WHEN "failedLoginCount" + 1 >= ${MAX_FAILED_ATTEMPTS} THEN now() + make_interval(mins => ${LOCK_MINUTES})
        ELSE "lockedUntil"
      END,
      "updatedAt" = now()
    WHERE "id" = ${userId}
      AND ("lockedUntil" IS NULL OR "lockedUntil" <= now())
    RETURNING "failedLoginCount"`;
  return rows[0]?.failedLoginCount ?? null;
}

export async function login(emailInput: string, password: string): Promise<LoginResult> {
  const email = emailInput.trim().toLowerCase();
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

  if (!user) {
    await verifyPassword(password, await getDummyHash()); // same timing as a real check
    return { ok: false, error: GENERIC_ERROR };
  }

  const attempt = await claimAttempt(user.id);
  if (attempt === null) return { ok: false, error: await lockedMessage(user.id) };

  if (!(await verifyPassword(password, user.passwordHash))) {
    return attempt >= MAX_FAILED_ATTEMPTS
      ? { ok: false, error: await lockedMessage(user.id) }
      : { ok: false, error: GENERIC_ERROR };
  }

  // Deactivated accounts get the generic error (after the password check, so timing matches).
  if (!user.active) return { ok: false, error: GENERIC_ERROR };

  // Correct password: clear the counter, including a lock set by this very attempt.
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null } }),
    prisma.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } }),
  ]);
  await createSession(user.id);
  return { ok: true };
}
