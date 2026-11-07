// One place for image uploads, so switching from Firebase Storage to
// Cloudinary (free, no billing) later is a change to this file only.
// Owned by Part A; Part B can import it for product photos and store logos.

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads an image and returns its public URL.
 * `folder` matches storage.rules: "portfolio" | "posts" | "products" | "stores".
 */
export async function uploadImage(file: File, folder: string, uid: string): Promise<string> {
  const r = ref(storage, `${folder}/${uid}/${Date.now()}-${file.name}`);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}
