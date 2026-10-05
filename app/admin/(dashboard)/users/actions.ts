"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createUser, resetUserPassword, setUserActive } from "@/lib/admin/users";
import type { ActionResult } from "@/lib/admin/orders";

// Admin-only: each action re-checks the role.

export async function createUserAction(input: {
  email: unknown;
  name: unknown;
  role: unknown;
  password: unknown;
}): Promise<ActionResult> {
  await requireUser("ADMIN");
  const result = await createUser({ email: input?.email, name: input?.name, role: input?.role, password: input?.password });
  if (result.ok) refresh();
  return result;
}

export async function setUserActiveAction(userId: unknown, active: unknown): Promise<ActionResult> {
  const actor = await requireUser("ADMIN");
  const result = await setUserActive(userId, active === true, actor);
  if (result.ok) refresh();
  return result;
}

export async function resetPasswordAction(userId: unknown, password: unknown): Promise<ActionResult> {
  const actor = await requireUser("ADMIN");
  return resetUserPassword(userId, password, actor);
}
