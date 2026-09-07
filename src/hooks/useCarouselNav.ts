"use client";

import { useRef, useState } from "react";
import type { Swiper as SwiperClass } from "swiper/types";

/** The prev/next-button wiring every Swiper-based carousel in this app needs
 * — a ref to the instance, and disabled-at-the-edges state kept in sync via
 * Swiper's own onSwiper/onSlideChange callbacks (works the same whether the
 * carousel loops or not — Swiper still reports real isBeginning/isEnd for
 * the current slide either way). Callers wire `onSwiper`/`onSlideChange`
 * into their own `<Swiper>` and `goPrev`/`goNext`/`canGoPrev`/`canGoNext`
 * into their own button JSX — this owns only the state, not any markup. */
export function useCarouselNav() {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [canGoPrev, setCanGoPrev] = useState(true);
  const [canGoNext, setCanGoNext] = useState(true);

  function sync(swiper: SwiperClass) {
    setCanGoPrev(!swiper.isBeginning);
    setCanGoNext(!swiper.isEnd);
  }

  return {
    canGoPrev,
    canGoNext,
    goPrev: () => swiperRef.current?.slidePrev(),
    goNext: () => swiperRef.current?.slideNext(),
    onSwiper: (swiper: SwiperClass) => {
      swiperRef.current = swiper;
      sync(swiper);
    },
    onSlideChange: sync,
  };
}
