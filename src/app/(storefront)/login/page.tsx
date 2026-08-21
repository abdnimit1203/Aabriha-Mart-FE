"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth";
import { GoogleIcon } from "@/components/icons";
import { PasswordInput } from "@/components/PasswordInput";
import { AuthBrandHeader } from "@/components/AuthBrandHeader";
import { useAuth } from "@/context/AuthContext";

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "Incorrect email or password.";
  }
  if (code === "auth/too-many-requests") return "Too many attempts. Please wait a moment and try again.";
  if (code === "auth/operation-not-allowed") return "Email/password sign-in isn't enabled yet.";
  return "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      toast.success("Welcome back!");
      router.push("/account");
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome back!");
      router.push("/account");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user) {
    return <main className="mx-auto max-w-sm px-4 py-12 sm:px-6" />;
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-12 sm:px-6">
      <AuthBrandHeader />
      <h1 className="mt-8 text-center text-2xl font-semibold tracking-tight">Sign in</h1>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <form onSubmit={handleEmailLogin} className="space-y-4">
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
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <PasswordInput id="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="mt-1.5 text-right">
              <Link href="/forgot-password" className="text-xs font-medium text-primary-strong hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-50"
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/create-account" className="font-medium text-primary-strong hover:underline">
          Create an Account
        </Link>
      </p>
    </main>
  );
}
