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

/** Firebase side of signup only — see AuthContext's `signUp` for the full
 * sequence including the Mongo profile, which needs React state to
 * coordinate against the auth-state listener. */
export async function createFirebaseAccount(email: string, password: string, username: string): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: username });
  await sendEmailVerification(credential.user);
  return credential.user;
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
