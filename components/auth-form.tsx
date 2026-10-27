"use client";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
export function AuthForm({ available, emailReady = false }: { available: boolean; emailReady?: boolean }) {
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  if (!available)
    return (
      <p className="notice">
        Accounts are temporarily unavailable. You can still explore examples and calculate ownership
        costs.
      </p>
    );
  return (
    <form
      className="panel p-7"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError("");
        try {
          const result = signup
            ? await authClient.signUp.email({ name, email, password })
            : await authClient.signIn.email({ email, password });
          if (result.error) setError(result.error.message || "Could not sign in.");
          else if (signup && emailReady) setError("Check your email to verify your account, then sign in. Email ownership does not verify seller identity.");
          else window.location.assign("/dashboard");
        } catch {
          setError("Could not reach the account service. Please try again.");
        } finally {
          setPending(false);
        }
      }}
    >
      <h2 className="mb-6 text-2xl font-bold">
        {signup ? "Create your Carpur account" : "Welcome back"}
      </h2>
      {signup && (
        <label className="label mb-5">
          Your name
          <input
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      )}
      <label className="label mb-5">
        Email
        <input
          autoComplete="email"
          required
          type="email"
          maxLength={254}
          className="field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="label">
        Password
        <input
          autoComplete={signup ? "new-password" : "current-password"}
          required
          type="password"
          minLength={12}
          maxLength={128}
          className="field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {signup && (
        <p className="mt-3 text-xs text-slate-400">
          Use at least 12 characters and a password manager. Recovery and verification need configured account email.
        </p>
      )}
      {error && (
        <p role="alert" className="notice mt-5">
          {error}
        </p>
      )}
      <Button type="submit" className="mt-6 w-full" disabled={pending}>
        {pending ? "Please wait…" : signup ? "Create account" : "Sign in"}
      </Button>
      <button
        type="button"
        className="mt-6 w-full text-sm text-blue-300"
        onClick={() => {
          setSignup(!signup);
          setError("");
        }}
      >
        {signup ? "Already have an account? Sign in" : "New to Carpur? Create an account"}
      </button>
      <Link href="/forgot-password" className="mt-5 block text-sm text-blue-300">Forgot password?</Link>
      {emailReady && <button type="button" className="mt-4 text-sm text-blue-300" disabled={pending || !email} onClick={async () => {
        setPending(true); try { const result = await authClient.sendVerificationEmail({ email, callbackURL: "/dashboard" }); setError(result.error?.message || "If verification is available for this account, an email has been requested."); } catch { setError("Verification could not be requested."); } finally { setPending(false); }
      }}>Request verification email</button>}
      {signup && (
        <p className="mt-5 text-xs leading-relaxed text-slate-400">
          By creating an account, you agree to the privacy and marketplace terms. Do not send
          identity documents, banking information or financial statements through Carpur.
        </p>
      )}
    </form>
  );
}
