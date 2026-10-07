"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth/login";

export type LoginState = { error: string | null };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Enter your email and password." };
  }

  const result = await login(email, password);
  if (!result.ok) return { error: result.error };
  redirect("/admin"); // admins land on Overview; staff are sent on to Orders
}
