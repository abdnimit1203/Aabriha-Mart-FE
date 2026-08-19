const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, idToken?: string): Promise<T> {
  const isGet = !options.method || options.method === "GET";
  const res = await fetch(`${API_URL}${path}`, {
    // Public GET calls (catalog browsing) are safe to cache briefly server-side
    // so pages stay statically prerenderable instead of going fully dynamic.
    // In dev, that cache just makes local changes look broken (stale results
    // after editing the backend/reseeding) — skip it outside production.
    ...(isGet ? (process.env.NODE_ENV === "production" ? { next: { revalidate: 60 } } : { cache: "no-store" }) : {}),
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? "Request failed.");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
