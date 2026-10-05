"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const inputClass =
  "w-full bg-transparent border border-outline-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, { error: null });

  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="text-sm mb-2 block">Email</span>
        <input name="email" type="email" autoComplete="username" required className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm mb-2 block">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      {state.error && <p className="text-error text-sm">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-on-primary py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
