// Client-side Firebase. Owned by Part A.
// Exports: auth, db, storage, signInWithGoogle, signOutUser, useUser().

import { useEffect, useState } from "react";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { UserProfile } from "./types";
import { PUBLIC_FIREBASE_CONFIG } from "./firebase-public-config";

// Env vars win; otherwise fall back to the shared project's public web config.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || PUBLIC_FIREBASE_CONFIG.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || PUBLIC_FIREBASE_CONFIG.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || PUBLIC_FIREBASE_CONFIG.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || PUBLIC_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || PUBLIC_FIREBASE_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || PUBLIC_FIREBASE_CONFIG.appId,
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Reuse the app across hot reloads. Placeholders keep the build and the
// "not configured" notice working before .env.local exists.
const app = getApps().length
  ? getApp()
  : initializeApp(
      firebaseConfigured
        ? firebaseConfig
        : { ...firebaseConfig, apiKey: "not-configured", projectId: "not-configured" },
    );

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function signInWithGoogle() {
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOutUser() {
  await signOut(auth);
}

export interface CurrentUser {
  /** Still working out who is signed in. Render nothing auth-dependent yet. */
  loading: boolean;
  /** The Firebase Auth user, or null when signed out. */
  authUser: User | null;
  /** The users/{uid} document, or null when signed out or not onboarded yet. */
  profile: UserProfile | null;
}

/**
 * The signed-in user plus their live users/{uid} profile.
 * `profile === null` with an `authUser` means they still need onboarding.
 */
export function useUser(): CurrentUser {
  const [state, setState] = useState<CurrentUser>({ loading: true, authUser: null, profile: null });

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    const unsubAuth = onAuthStateChanged(auth, (authUser) => {
      unsubProfile?.();
      unsubProfile = undefined;
      if (!authUser) {
        setState({ loading: false, authUser: null, profile: null });
        return;
      }
      setState((s) => ({ ...s, loading: true, authUser }));
      unsubProfile = onSnapshot(
        doc(db, "users", authUser.uid),
        (snap) => {
          const profile = snap.exists() ? ({ uid: snap.id, ...snap.data() } as UserProfile) : null;
          setState({ loading: false, authUser, profile });
        },
        () => setState({ loading: false, authUser, profile: null }),
      );
    });
    return () => {
      unsubProfile?.();
      unsubAuth();
    };
  }, []);

  return state;
}

/** Firebase ID token for calling our own API routes (send as `Authorization: Bearer <token>`). */
export async function getIdToken(): Promise<string | null> {
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
}
