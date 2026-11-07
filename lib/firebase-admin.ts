// Server-only Firebase Admin. Owned by Part A.
// Used by API routes to verify sign-in. Next.js only: the seed script must
// initialize its own admin app, because "server-only" throws outside Next.

import "server-only";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set. See .env.local.example.");
  const parsed = JSON.parse(raw);
  // Env vars often store the key's newlines as literal "\n" sequences.
  if (typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return parsed;
}

const app = getApps().length ? getApp() : initializeApp({ credential: cert(loadServiceAccount()) });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

/**
 * Checks the `Authorization: Bearer <idToken>` header.
 * Returns the caller's uid, or null when the token is missing or invalid.
 */
export async function verifyRequest(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
