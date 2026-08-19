import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  GoogleAuthProvider,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
import { UserProfile } from "@/types/user";

const googleProvider = new GoogleAuthProvider();

/** Creates the Firebase account only — nothing else. See AuthContext's
 * `signUp` for the full sequence including the Mongo profile, which needs
 * React state to coordinate against the auth-state listener. Kept minimal
 * on purpose: the account must exist before anything else can happen, so
 * this is the one step that's allowed to block/fail the whole signup. */
export async function createFirebaseAccount(email: string, password: string): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/** Display name + verification email — cosmetic, non-critical follow-ups
 * to account creation. Best-effort: a hiccup here (e.g. Firebase rate
 * limits on repeated signups) must not be allowed to abort a signup whose
 * account and Mongo profile already exist. */
export async function decorateFirebaseAccount(user: FirebaseUser, username: string): Promise<void> {
  try {
    await updateProfile(user, { displayName: username });
    await sendEmailVerification(user);
  } catch (err) {
    console.error("Non-critical post-signup step failed:", err);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function resendVerificationEmail(): Promise<void> {
  if (auth.currentUser) await sendEmailVerification(auth.currentUser);
}

/** Creates (or fetches) the Mongo-side profile matching the current Firebase user. */
export async function syncProfile(idToken: string, fields?: { username?: string; phone?: string }) {
  return apiFetch<UserProfile>(
    "/api/auth/sync",
    { method: "POST", body: JSON.stringify(fields ?? {}) },
    idToken
  );
}

export async function fetchMyProfile(idToken: string) {
  return apiFetch<UserProfile>("/api/auth/me", {}, idToken);
}

export async function updateMyProfile(idToken: string, fields: Partial<UserProfile>) {
  return apiFetch<UserProfile>("/api/auth/me", { method: "PATCH", body: JSON.stringify(fields) }, idToken);
}
