// Env-driven for now — set NEXT_PUBLIC_ANNOUNCEMENT_TEXT to show it, clear it
// to hide it. No admin UI yet; that's a future admin-dashboard build.
export function AnnouncementBar() {
  const text = process.env.NEXT_PUBLIC_ANNOUNCEMENT_TEXT;
  if (!text) return null;

  return (
    <div className="bg-primary-strong px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
      {text}
    </div>
  );
}
