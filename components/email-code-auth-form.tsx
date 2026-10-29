"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function EmailCodeAuthForm({ onPassword }: { onPassword: () => void }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [requested, setRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function requestCode() {
    if (busy) return;
    setBusy(true);
    setStatus("");
    setError("");
    try {
      const response = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: "sign-in",
      });
      if (response.error) throw new Error(response.error.message || "Could not send a code.");
      setRequested(true);
      setOtp("");
      setStatus("If your account supports email sign-in, check your inbox for a six-digit code.");
    } catch {
      setError("We could not send a code. Try again later or use your password.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    if (busy || !/^[0-9]{6}$/.test(otp)) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const result = await authClient.signIn.emailOtp({
        email: email.trim(),
        otp,
      });
      if (result.error) throw new Error(result.error.message || "Verification failed.");
      setOtp("");
      window.location.assign("/dashboard");
    } catch {
      setError("This code is invalid or expired. Check it or request another code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel p-7" aria-label="Email code sign-in">
      <h2 className="mb-4 text-2xl font-bold">Sign in with an email code</h2>
      <p className="mb-5 text-sm text-slate-400">
        Use a single-use six-digit code instead of your password. For existing Carpur accounts.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void (requested ? verifyCode() : requestCode());
        }}
      >
        <label className="label mb-5">
          Email address
          <input
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            className="field"
            value={email}
            disabled={requested || busy}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {requested && (
          <label className="label">
            Six-digit code
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              minLength={6}
              maxLength={6}
              required
              autoComplete="one-time-code"
              className="field"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            />
          </label>
        )}
        {status && (
          <p role="status" className="mt-4 text-sm text-slate-400">
            {status}
          </p>
        )}
        {error && (
          <p role="alert" className="notice mt-4">
            {error}
          </p>
        )}
        <Button type="submit" className="mt-6 w-full" disabled={busy}>
          {busy ? "Please wait…" : requested ? "Verify and sign in" : "Email me a code"}
        </Button>
      </form>
      {requested && (
        <div className="mt-4 flex gap-5">
          <button
            type="button"
            className="text-sm text-blue-300"
            disabled={busy}
            onClick={() => void requestCode()}
          >
            Resend code
          </button>
          <button
            type="button"
            className="text-sm text-blue-300"
            disabled={busy}
            onClick={() => {
              setRequested(false);
              setOtp("");
              setError("");
              setStatus("");
            }}
          >
            Change email
          </button>
        </div>
      )}
      <button
        type="button"
        className="mt-6 text-sm text-blue-300"
        disabled={busy}
        onClick={onPassword}
      >
        Use a password instead
      </button>
      <p className="mt-4 text-xs text-slate-400">
        Codes expire after five minutes. Never share a sign-in code with a buyer or seller. Email
        ownership does not verify seller identity.
      </p>
    </section>
  );
}
