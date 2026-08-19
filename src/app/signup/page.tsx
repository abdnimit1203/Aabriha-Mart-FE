"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signUpWithEmail, signInWithGoogle } from "@/lib/auth";
import { GoogleIcon } from "@/components/icons";
import { useAuth } from "@/context/AuthContext";

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code === "auth/email-already-in-use") return "An account with that email already exists.";
  if (code === "auth/weak-password") return "Password should be at least 6 characters.";
  if (code === "auth/invalid-email") return "That email address doesn't look right.";
  if (code === "auth/operation-not-allowed") return "Email/password sign-in isn't enabled yet.";
  return "Something went wrong. Please try again.";
}

export default function SignupPage() {
  const router = useRouter();
  const { setPendingProfileFields } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      // Must be set before signUpWithEmail — that call flips Firebase's auth
      // state, which triggers AuthContext's own profile-creating sync. Only
      // one thing may ever create the profile; this is how it learns the
      // username/phone instead of racing a second sync call against it.
      setPendingProfileFields({ username, phone });
      await signUpWithEmail(email, password, username);
      toast.success(`Welcome, ${username}!`);
      router.push("/account");
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignup() {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome!");
      router.push("/account");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
            />
          </div>
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
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              required
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:opacity-50"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-50"
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary-strong hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
