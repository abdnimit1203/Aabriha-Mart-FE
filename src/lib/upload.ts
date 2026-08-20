import imageCompression from "browser-image-compression";
import { apiFetch } from "@/lib/api";

interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
}

const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? "";

// Every upload nests under one root folder in the ImageKit media library
// instead of scattering top-level folders per resource type, so the library
// stays tidy as more upload types get added.
const ROOT_FOLDER = "/aabriha-mart";

async function compressImage(file: File, maxSizeMB: number, maxWidthOrHeight: number): Promise<File> {
  // Skip compression for files already under budget — recompressing a small
  // file can occasionally make it larger (re-encoding overhead).
  if (file.size <= maxSizeMB * 1024 * 1024) return file;

  try {
    return await imageCompression(file, { maxSizeMB, maxWidthOrHeight, useWebWorker: true });
  } catch {
    // If compression fails for any reason, upload the original rather than
    // blocking the user entirely — ImageKit still enforces its own limits.
    return file;
  }
}

async function uploadToImageKit(file: File, idToken: string, folder: string): Promise<string> {
  const auth = await apiFetch<ImageKitAuthParams>("/api/uploads/imagekit-auth", {}, idToken);

  const form = new FormData();
  form.append("file", file);
  form.append("fileName", file.name);
  form.append("publicKey", IMAGEKIT_PUBLIC_KEY);
  form.append("signature", auth.signature);
  form.append("expire", String(auth.expire));
  form.append("token", auth.token);
  form.append("folder", `${ROOT_FOLDER}${folder}`);
  form.append("useUniqueFileName", "true");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Upload failed.");
  }

  const data = await res.json();
  return data.url as string;
}

/** Compresses (avatars don't need to be huge — 512px/300KB is plenty) then
 * uploads directly to ImageKit using short-lived signed params from our
 * backend, so the private key never reaches the browser. */
export async function uploadAvatar(file: File, idToken: string): Promise<string> {
  const compressed = await compressImage(file, 0.3, 512);
  return uploadToImageKit(compressed, idToken, "/avatars");
}

/** Product/category gallery images need more headroom than an avatar —
 * 1600px/1MB keeps zoomed product photos sharp while still capping upload size. */
export async function uploadCatalogImage(
  file: File,
  idToken: string,
  folder: "/products" | "/categories" | "/hero-banners" | "/promotions" | "/welcome-popup"
): Promise<string> {
  const compressed = await compressImage(file, 1, 1600);
  return uploadToImageKit(compressed, idToken, folder);
}
