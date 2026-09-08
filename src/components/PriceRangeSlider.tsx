"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useProductFilterTransition } from "@/context/ProductFilterTransitionContext";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

/** Dual-thumb price filter — two native range inputs (draggable, keyboard-
 * accessible, robust) driving a Framer Motion spring for the visible fill
 * bar, so the *feel* is a smooth, slightly-elastic glide even though the
 * underlying input snaps to whole steps. Editable Min/Max number boxes
 * above the track let a value be typed directly instead of only dragged.
 * Same debounced URL-push + local-state-first pattern as CategorySidebar,
 * so a drag/edit feels instant while the actual product refetch only fires
 * once things settle.
 *
 * step is always 1 (whole ৳ amounts), deliberately never a computed
 * "~100 steps" value — a step that doesn't evenly divide (ceiling - floor)
 * makes the true max unreachable by dragging (the browser clamps the last
 * reachable snapped position below it, e.g. stuck at 3192 instead of a real
 * ceiling of 3200), which is exactly what happened here before. */
export function PriceRangeSlider({ bounds }: { bounds: { min: number; max: number } }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startFilterTransition } = useProductFilterTransition();

  const { min: floor, max: ceiling } = bounds;

  function fromUrl() {
    const urlMin = searchParams.get("minPrice");
    const urlMax = searchParams.get("maxPrice");
    return {
      min: urlMin ? Math.max(floor, Number(urlMin)) : floor,
      max: urlMax ? Math.min(ceiling, Number(urlMax)) : ceiling,
    };
  }

  const [range, setRange] = useState(fromUrl);
  const waitingFor = useRef<string | null | undefined>(undefined);
  const urlKey = `${searchParams.get("minPrice") ?? ""}-${searchParams.get("maxPrice") ?? ""}`;

  useEffect(() => {
    if (waitingFor.current !== undefined && urlKey !== waitingFor.current) return;
    waitingFor.current = undefined;
    setRange(fromUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function pushRange(next: { min: number; max: number }, delay = 400) {
    setRange(next);
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.min > floor) params.set("minPrice", String(next.min));
      else params.delete("minPrice");
      if (next.max < ceiling) params.set("maxPrice", String(next.max));
      else params.delete("maxPrice");
      waitingFor.current = `${params.get("minPrice") ?? ""}-${params.get("maxPrice") ?? ""}`;
      startFilterTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
    }, delay);
  }

  // Raw 0-100 percentages, spring-smoothed purely for the fill bar's visual
  // motion — the inputs/labels themselves always reflect the real value
  // instantly, this is decoration layered on top, not the source of truth.
  const minPct = useMotionValue(0);
  const maxPct = useMotionValue(100);
  const smoothMin = useSpring(minPct, { stiffness: 300, damping: 32 });
  const smoothMax = useSpring(maxPct, { stiffness: 300, damping: 32 });

  useEffect(() => {
    const span = ceiling - floor || 1;
    minPct.set(((range.min - floor) / span) * 100);
    maxPct.set(((range.max - floor) / span) * 100);
  }, [range, floor, ceiling, minPct, maxPct]);

  const left = useTransform(smoothMin, (v) => `${v}%`);
  const width = useTransform([smoothMin, smoothMax] as const, ([a, b]: number[]) => `${Math.max(0, b - a)}%`);

  if (floor >= ceiling) return null;

  function handleMinField(raw: string) {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const next = Math.min(Math.max(floor, Math.round(parsed)), range.max - 1);
    pushRange({ min: next, max: range.max }, 600);
  }

  function handleMaxField(raw: string) {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const next = Math.max(Math.min(ceiling, Math.round(parsed)), range.min + 1);
    pushRange({ min: range.min, max: next }, 600);
  }

  return (
    <div>
      <p className="text-sm font-semibold">Pricing</p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="minPrice" className="mb-1 block text-xs text-muted-foreground">
            Min
          </label>
          <input
            id="minPrice"
            type="number"
            min={floor}
            max={range.max - 1}
            value={range.min}
            onChange={(e) => handleMinField(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="mb-1 block text-xs text-muted-foreground">
            Max
          </label>
          <input
            id="maxPrice"
            type="number"
            min={range.min + 1}
            max={ceiling}
            value={range.max}
            onChange={(e) => handleMaxField(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="relative mt-4 h-5">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border" />
        <motion.div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary-strong"
          style={{ left, width }}
        />
        <input
          type="range"
          className="price-range-input"
          min={floor}
          max={ceiling}
          step={1}
          value={range.min}
          aria-label="Minimum price"
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), range.max - 1);
            pushRange({ min: next, max: range.max });
          }}
        />
        <input
          type="range"
          className="price-range-input"
          min={floor}
          max={ceiling}
          step={1}
          value={range.max}
          aria-label="Maximum price"
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), range.min + 1);
            pushRange({ min: range.min, max: next });
          }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>৳{floor.toLocaleString()}</span>
        <span>৳{ceiling.toLocaleString()}</span>
      </div>
    </div>
  );
}
