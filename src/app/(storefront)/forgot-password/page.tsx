"use client";

import { useState } from "react";
import { sendPasswordReset } from "@/lib/auth";
import { AuthBrandHeader } from "@/components/AuthBrandHeader";
import { useAuth } from "@/context/AuthContext";

function friendlyResetError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  if (code === "auth/too-many-requests") return "Too many attempts. Please wait a moment and try again.";
  return "Something went wrong. Please try again.";
}

export default function ForgotPasswordPage() {
  const { openLoginModal } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      // "No account with that email" is deliberately not surfaced as its own
      // message — Firebase's user-not-found is treated the same as a real
      // send, so this form can't be used to probe which emails are registered.
      const code = (err as { code?: string })?.code ?? "";
      if (code === "auth/user-not-found") {
        setSent(true);
      } else {
        setError(friendlyResetError(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-12 sm:px-6">
      <AuthBrandHeader />
      <h1 className="mt-8 text-center text-2xl font-semibold tracking-tight">Reset your password</h1>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        {sent ? (
          <div className="text-center">
            <p className="text-sm text-foreground">
              If an account exists for <span className="font-medium">{email}</span>, we&apos;ve sent a link to reset
              your password.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Check your inbox (and spam folder) for the email.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Enter the email address on your account and we&apos;ll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
                />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:opacity-50"
              >
                {submitting ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <button type="button" onClick={openLoginModal} className="font-medium text-primary-strong hover:underline">
          Sign in
        </button>
      </p>
    </main>
  );
}
