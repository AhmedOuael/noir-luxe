import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../prisma";

export const SESSION_COOKIE = "noir_admin_session";
const SESSION_DAYS = 7;

export type Role = "ADMIN" | "STAFF";

/** Safe-to-render user shape (never includes the password hash). */
export type SessionUser = { id: bigint; email: string; name: string; role: Role };

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: bigint) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

/** The logged-in, active user for this request, or null. Deduplicated per render. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true, active: true } } },
  });
  if (!session || session.expiresAt < new Date() || !session.user.active) return null;

  const { id, email, name, role } = session.user;
  return { id, email, name, role: role as Role };
});

/**
 * Use at the top of every admin page AND every admin Server Action
 * (actions are reachable by direct POST, so the proxy/layout check isn't enough).
 */
export async function requireUser(role?: Role): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (role === "ADMIN" && user.role !== "ADMIN") redirect("/admin/orders");
  return user;
}
