"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signOutUser } from "@/lib/auth";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";

export function AccountMenu() {
  const router = useRouter();
  const { user, profile, loading, openLoginModal } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useDismissableOverlay<HTMLDivElement>({ open, onDismiss: () => setOpen(false) });

  async function handleSignOut() {
    setOpen(false);
    await signOutUser();
    router.push("/");
  }

  if (loading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-border sm:h-9 sm:w-9" aria-hidden />;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={openLoginModal}
        className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-background"
      >
        Sign in
      </button>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded-full p-0.5 hover:bg-background"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt=""
            className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-strong text-sm font-medium text-white sm:h-9 sm:w-9">
            {user.initial}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-52 rounded-2xl border border-border bg-surface p-2 shadow-lg"
        >
          <p className="truncate px-3 pb-2 pt-1 text-sm font-medium">{profile?.name ?? "My Account"}</p>
          <div className="border-t border-border pt-1">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm hover:bg-background"
            >
              Account Settings
            </Link>
            <Link
              href="/orders"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm hover:bg-background"
            >
              Orders
            </Link>
            {profile?.role === "super_admin" && (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm hover:bg-background"
              >
                Dashboard
              </Link>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-danger hover:bg-background"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
