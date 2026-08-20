"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createFirebaseAccount, decorateFirebaseAccount, fetchMyProfile, syncProfile } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { UserProfile } from "@/types/user";

export interface AuthUser {
  photoURL: string | null;
  /** Upper-cased first letter to show when there's no photo. */
  initial: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  /** True once signed in but the profile still needs a phone number (Google
   * sign-in defers this — see backend authController). */
  needsProfileCompletion: boolean;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  /** Forces a fresh ID token before re-fetching the profile — needed
   * specifically after email verification, since Firebase's cached token
   * keeps its stale email_verified claim for up to an hour otherwise. */
  refreshProfile: () => Promise<void>;
  /** Creates the Firebase account and its Mongo profile as one sequenced
   * operation, in that order, and is the only thing that ever passes
   * username/phone to the profile-sync endpoint. */
  signUp: (email: string, password: string, fields: { username: string; phone: string }) => Promise<FirebaseUser>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // Firebase's onAuthStateChanged is a single global listener — it also
  // fires mid-way through signUp() below (as soon as the Firebase account
  // exists), racing signUp()'s own explicit, field-carrying sync call. Set
  // for the duration of signUp() so this listener's generic no-fields sync
  // steps aside instead of possibly winning the create and discarding the
  // username/phone the signup form collected.
  const suppressAutoSync = useRef(false);

  const loadProfile = useCallback(async (user: FirebaseUser, forceToken = false) => {
    const idToken = await user.getIdToken(forceToken);
    try {
      const existing = await fetchMyProfile(idToken);
      setProfile(existing);
    } catch (err) {
      // 401 here specifically means "token is valid but no Mongo profile
      // yet" (requireAuth) — first-time Google sign-in, so create one.
      if (err instanceof ApiError && err.status === 401) {
        if (suppressAutoSync.current) return;
        const created = await syncProfile(idToken);
        setProfile(created);
      } else {
        throw err;
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadProfile(user).catch(() => setProfile(null));
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [loadProfile]);

  async function getIdToken(forceRefresh = false) {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken(forceRefresh);
  }

  async function refreshProfile() {
    if (!auth.currentUser) return;
    // reload() pulls Firebase's current verification status onto the local
    // user object; forcing the *token* refresh (not just reload) is what
    // actually gets email_verified into the JWT claim the backend reads.
    await auth.currentUser.reload();
    await loadProfile(auth.currentUser, true);
  }

  async function signUp(email: string, password: string, fields: { username: string; phone: string }) {
    suppressAutoSync.current = true;
    try {
      const fbUser = await createFirebaseAccount(email, password);
      const idToken = await fbUser.getIdToken();
      const created = await syncProfile(idToken, fields);
      setProfile(created);
      // Best-effort, after the profile that actually matters is safely
      // created — a failure here must not undo or fail the signup.
      await decorateFirebaseAccount(fbUser, fields.username);
      return fbUser;
    } finally {
      suppressAutoSync.current = false;
    }
  }

  // Firebase-specific fields (photoURL, email) stop here — every caller gets
  // a resolved shape instead of reaching past `profile` into `firebaseUser`.
  const user = useMemo<AuthUser | null>(() => {
    if (!firebaseUser) return null;
    return {
      photoURL: profile?.profileImage || firebaseUser.photoURL || null,
      initial: (profile?.username ?? firebaseUser.email ?? "?").charAt(0).toUpperCase(),
    };
  }, [firebaseUser, profile]);

  const needsProfileCompletion = Boolean(profile && !profile.phone);

  return (
    <AuthContext.Provider value={{ user, profile, loading, needsProfileCompletion, getIdToken, refreshProfile, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
