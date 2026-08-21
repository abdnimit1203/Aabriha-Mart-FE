import { apiFetch } from "@/lib/api";
import { Analytics } from "@/types/analytics";

export type AnalyticsRange = { mode: "days"; days: 7 | 30 | 90 } | { mode: "month"; month: number; year: number };

export async function getAnalyticsAdmin(idToken: string, range: AnalyticsRange) {
  const query =
    range.mode === "month" ? `range=month&month=${range.month}&year=${range.year}` : `range=days&days=${range.days}`;
  return apiFetch<Analytics>(`/api/admin/analytics?${query}`, {}, idToken);
}
