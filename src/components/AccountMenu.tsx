"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signOutUser } from "@/lib/auth";

const CLOSE_DELAY_MS = 150;

export function AccountMenu() {
  const router = useRouter();
  const { firebaseUser, profile, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  async function handleSignOut() {
    setOpen(false);
    await signOutUser();
    router.push("/");
  }

  if (loading) {
    return <div className="h-7 w-7 animate-pulse rounded-full bg-border sm:h-9 sm:w-9" aria-hidden />;
  }

  if (!firebaseUser) {
    return (
      <Link
        href="/login"
        className="whitespace-nowrap rounded-full px-2 py-1.5 text-xs font-medium transition-colors hover:bg-background sm:px-3 sm:py-2 sm:text-sm"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded-full p-0.5 hover:bg-background"
      >
        {profile?.profileImage || firebaseUser.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile?.profileImage || firebaseUser.photoURL || ""}
            alt=""
            className="h-7 w-7 rounded-full object-cover sm:h-8 sm:w-8"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-strong text-xs font-medium text-white sm:h-8 sm:w-8 sm:text-sm">
            {(profile?.username ?? firebaseUser.email ?? "?").charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-52 rounded-2xl border border-border bg-surface p-2 shadow-lg"
        >
          <p className="truncate px-3 pb-2 pt-1 text-sm font-medium">{profile?.username ?? "My Account"}</p>
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
