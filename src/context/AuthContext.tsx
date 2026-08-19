"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { fetchMyProfile, syncProfile } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { UserProfile } from "@/types/user";

interface PendingProfileFields {
  username?: string;
  phone?: string;
}

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  /** True once signed in but the profile still needs a phone number (Google
   * sign-in defers this — see backend authController). */
  needsProfileCompletion: boolean;
  getIdToken: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
  /** Call right before signUpWithEmail so the profile this auth-state-change
   * creates uses the username/phone from the signup form. There is only ever
   * one profile-creating sync call (here) — a page must never call
   * syncProfile itself too, or the two race and whichever loses silently
   * gets its data discarded. */
  setPendingProfileFields: (fields: PendingProfileFields) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pendingFields = useRef<PendingProfileFields | null>(null);

  const loadProfile = useCallback(async (user: FirebaseUser) => {
    const idToken = await user.getIdToken();
    try {
      const existing = await fetchMyProfile(idToken);
      setProfile(existing);
    } catch (err) {
      // 401 here specifically means "token is valid but no Mongo profile
      // yet" (requireAuth) — first sign-in, so create one.
      if (err instanceof ApiError && err.status === 401) {
        const fields = pendingFields.current ?? undefined;
        pendingFields.current = null;
        const created = await syncProfile(idToken, fields);
        setProfile(created);
      } else {
        throw err;
      }
    }
  }, []);

  function setPendingProfileFields(fields: PendingProfileFields) {
    pendingFields.current = fields;
  }

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

  async function getIdToken() {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  }

  async function refreshProfile() {
    if (auth.currentUser) await loadProfile(auth.currentUser);
  }

  const needsProfileCompletion = Boolean(profile && !profile.phone);

  return (
    <AuthContext.Provider
      value={{ firebaseUser, profile, loading, needsProfileCompletion, getIdToken, refreshProfile, setPendingProfileFields }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
