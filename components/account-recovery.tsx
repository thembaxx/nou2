"use client";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function AccountRecovery({ available, token }: { available: boolean; token?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  if (!available) return <p className="notice">Account email is not configured on this deployment. No recovery email can be sent yet.</p>;
  return <form className="panel p-7" onSubmit={async (event) => {
    event.preventDefault(); setPending(true); setStatus("");
    try {
      if (token && password !== confirmation) { setStatus("The passwords must match."); return; }
      const result = token ? await authClient.resetPassword({ token, newPassword: password }) : await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
      if (result.error) setStatus(result.error.message || "The request could not be completed.");
      else setStatus(token ? "Password updated. Sign in with your new password; existing sessions have been revoked." : "If this account can receive recovery email, a reset link has been requested. Check your inbox and spam folder.");
    } catch { setStatus("The account service could not complete this request. Try again later."); }
    finally { setPending(false); }
  }}>
    <h2 className="mb-5 text-2xl font-bold">{token ? "Choose a new password" : "Recover your account"}</h2>
    {token ? <><label className="label">New password<input className="field" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(e) => setPassword(e.target.value)} /></label><label className="label mt-4">Confirm password<input className="field" type="password" autoComplete="new-password" required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></label></> : <label className="label">Account email<input className="field" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(e) => setEmail(e.target.value)} /></label>}
    <p role="status" className="my-4">{status}</p><Button disabled={pending} type="submit">{pending ? "Please wait…" : token ? "Update password" : "Request reset link"}</Button>
    <Link href="/sign-in" className="mt-5 block">Return to sign in</Link>
  </form>;
}
