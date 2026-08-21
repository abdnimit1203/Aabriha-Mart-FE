"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { signInWithGoogle } from "@/lib/auth";
import { GoogleIcon } from "@/components/icons";
import { PasswordInput } from "@/components/PasswordInput";
import { useAuth } from "@/context/AuthContext";

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code === "auth/email-already-in-use") return "An account with that email already exists.";
  if (code === "auth/weak-password") return "Password should be at least 6 characters.";
  if (code === "auth/invalid-email") return "That email address doesn't look right.";
  if (code === "auth/operation-not-allowed") return "Email/password sign-in isn't enabled yet.";
  return "Something went wrong. Please try again.";
}

export default function CreateAccountPage() {
  const router = useRouter();
  const { user, loading, signUp, openLoginModal } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password, { username, phone });
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

  if (loading || user) {
    return <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6" />;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm sm:grid sm:grid-cols-2"
      >
        {/* Decorative side — hidden on mobile, no room for a second column
           there. Ready to take a real photo (background-image or an <Image
           fill>) in place of the gradient once one's provided; nothing else
           on this page needs to change for that swap. */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-primary-strong p-10 text-white sm:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-black/10 blur-3xl"
          />
          <Link href="/" className="relative flex items-center gap-2">
            <Image src="/logo.png" alt="" width={40} height={40} className="rounded-xl bg-white/90 object-contain p-1" />
            <span className="font-logo text-xl font-normal tracking-wide">Aabriha Mart</span>
          </Link>
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight">Join Aabriha Mart!</h2>
            <p className="mt-2 max-w-xs text-sm text-white/85">
              Create an account to check out faster, track your orders, and save your delivery details for next time.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
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
              <PasswordInput
                id="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
                Confirm password
              </label>
              <PasswordInput
                id="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button type="button" onClick={openLoginModal} className="font-medium text-primary-strong hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
