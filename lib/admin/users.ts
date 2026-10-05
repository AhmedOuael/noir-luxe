import "server-only";
import { prisma } from "../prisma";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../auth/password";
import type { Role, SessionUser } from "../auth/session";
import type { ActionResult } from "./orders";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
};

export async function listUsers(): Promise<UserRow[]> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return users.map((u) => ({
    id: u.id.toString(),
    email: u.email,
    name: u.name,
    role: u.role as Role,
    active: u.active,
    createdAt: u.createdAt.toISOString(),
  }));
}

const isRole = (v: unknown): v is Role => v === "ADMIN" || v === "STAFF";

function checkPassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > 200) return "Password is too long.";
  return null;
}

export async function createUser(input: {
  email: unknown;
  name: unknown;
  role: unknown;
  password: unknown;
}): Promise<ActionResult> {
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return { ok: false, error: "Enter a valid email." };
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (name.length < 2 || name.length > 80) return { ok: false, error: "Enter the person's name." };
  if (!isRole(input.role)) return { ok: false, error: "Choose a role." };
  const passwordError = checkPassword(input.password);
  if (passwordError) return { ok: false, error: passwordError };

  if (await prisma.user.findUnique({ where: { email } })) {
    return { ok: false, error: "A user with this email already exists." };
  }
  await prisma.user.create({
    data: { email, name, role: input.role, passwordHash: await hashPassword(input.password as string) },
  });
  return { ok: true };
}

function parseTarget(id: unknown, actor: SessionUser): bigint | string {
  if (typeof id !== "string" || !/^\d{1,18}$/.test(id)) return "User not found.";
  if (BigInt(id) === actor.id) return "You can't change your own account here.";
  return BigInt(id);
}

/** Deactivating also logs the person out everywhere. */
export async function setUserActive(id: unknown, active: boolean, actor: SessionUser): Promise<ActionResult> {
  const target = parseTarget(id, actor);
  if (typeof target === "string") return { ok: false, error: target };
  await prisma.$transaction([
    prisma.user.update({ where: { id: target }, data: { active } }),
    ...(active ? [] : [prisma.session.deleteMany({ where: { userId: target } })]),
  ]);
  return { ok: true };
}

/** Sets a new password, clears any lockout and logs the person out everywhere. */
export async function resetUserPassword(id: unknown, password: unknown, actor: SessionUser): Promise<ActionResult> {
  const target = parseTarget(id, actor);
  if (typeof target === "string") return { ok: false, error: target };
  const passwordError = checkPassword(password);
  if (passwordError) return { ok: false, error: passwordError };
  await prisma.$transaction([
    prisma.user.update({
      where: { id: target },
      data: { passwordHash: await hashPassword(password as string), failedLoginCount: 0, lockedUntil: null },
    }),
    prisma.session.deleteMany({ where: { userId: target } }),
  ]);
  return { ok: true };
}
