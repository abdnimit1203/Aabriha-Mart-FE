"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth";
import { GoogleIcon, CloseIcon } from "@/components/icons";
import { PasswordInput } from "@/components/PasswordInput";
import { AuthBrandHeader } from "@/components/AuthBrandHeader";
import { useAuth } from "@/context/AuthContext";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "Incorrect email or password.";
  }
  if (code === "auth/too-many-requests") return "Too many attempts. Please wait a moment and try again.";
  if (code === "auth/operation-not-allowed") return "Email/password sign-in isn't enabled yet.";
  return "Something went wrong. Please try again.";
}

/** Login is a modal, not a page — opened from anywhere (account menu,
 * checkout/orders/account gating, "buy now" while logged out) via
 * AuthContext, and it closes itself the moment sign-in succeeds (see
 * AuthContext's onAuthStateChanged handler). The page underneath never
 * navigates away, so whatever the user was doing (viewing a product,
 * sitting on /checkout) is still there once they're signed in. */
export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const rootRef = useDismissableOverlay<HTMLDivElement>({ open: isLoginModalOpen, onDismiss: closeLoginModal });

  useEffect(() => {
    if (!isLoginModalOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isLoginModalOpen]);

  // Reset form state each time the modal is (re)opened, so a previous
  // attempt's typed password/error doesn't linger into the next open.
  // Genuine exception to the "no setState in an effect" rule (same as
  // DashboardHeader's clock) — this resets state in response to
  // isLoginModalOpen changing, not a sign the effect is unnecessary.
  useEffect(() => {
    if (isLoginModalOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail("");
      setPassword("");
      setSubmitting(false);
    }
  }, [isLoginModalOpen]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      toast.success("Welcome back!");
      // No explicit close here — AuthContext's auth-state listener closes
      // the modal itself once `user` actually populates.
    } catch (err) {
      toast.error(friendlyAuthError(err));
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome back!");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Sign in">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40"
          />

          <motion.div
            ref={rootRef}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl sm:p-8"
          >
        <button
          type="button"
          onClick={closeLoginModal}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-background"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div onClick={closeLoginModal}>
          <AuthBrandHeader />
        </div>
        <h2 className="mt-6 text-center text-2xl font-semibold tracking-tight">Sign in</h2>

        <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="modal-email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="modal-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
            />
          </div>
          <div>
            <label htmlFor="modal-password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <PasswordInput id="modal-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="mt-1.5 text-right">
              <Link
                href="/forgot-password"
                onClick={closeLoginModal}
                className="text-xs font-medium text-primary-strong hover:underline"
              >
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

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/create-account" onClick={closeLoginModal} className="font-medium text-primary-strong hover:underline">
            Create an Account
          </Link>
        </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
