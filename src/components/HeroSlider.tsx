"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

// Shaped to match the eventual backend Banner model (Section 23 CMS-managed
// content) so swapping the hardcoded array below for a fetch() later is a
// drop-in change, not a rewrite. Bn fields are carried but unused until the
// storefront actually gets a locale switch — render *En only for now.
export interface Banner {
  id: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  ctaLabelBn: string;
  ctaLabelEn: string;
  ctaUrl: string;
  desktopImage: string;
  mobileImage?: string;
  /** CSS object-position value, e.g. "center center", "80% center". Defaults to center. */
  objectPosition?: string;
  isActive: boolean;
  sortOrder: number;
}

const BANNERS: Banner[] = [
  {
    id: "women-collection",
    titleBn: "নারী সংগ্রহ",
    titleEn: "Women's Collection",
    subtitleBn: "প্রতিদিনের জন্য মার্জিত ফিট।",
    subtitleEn: "Elegant, everyday-ready fits.",
    ctaLabelBn: "কেনাকাটা করুন",
    ctaLabelEn: "Shop Women",
    ctaUrl: "/categories/womens-dresses",
    desktopImage: "https://ik.imagekit.io/abdnimit/Model_wearing_women.jpeg",
    objectPosition: "80% center",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "men-collection",
    titleBn: "পুরুষ সংগ্রহ",
    titleEn: "Men's Collection",
    subtitleBn: "প্রতিদিনের জন্য উপযুক্ত স্মার্ট ফিট।",
    subtitleEn: "Sharp fits, built for every day.",
    ctaLabelBn: "কেনাকাটা করুন",
    ctaLabelEn: "Shop Men",
    ctaUrl: "/categories/mens-shirts",
    desktopImage: "https://ik.imagekit.io/abdnimit/Model_wearing_panjabi_for_banner_202608190117.jpeg",
    objectPosition: "center 20%",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "shoes-bags",
    titleBn: "জুতা ও ব্যাগ",
    titleEn: "Shoes & Bags",
    subtitleBn: "মাথা থেকে পা পর্যন্ত সাজ সম্পূর্ণ করুন।",
    subtitleEn: "Finish the outfit, head to toe.",
    ctaLabelBn: "এখনই কিনুন",
    ctaLabelEn: "Shop Now",
    ctaUrl: "/categories/shoes",
    desktopImage: "https://ik.imagekit.io/abdnimit/Model_wearing_shoe-bag.jpeg",
    objectPosition: "center center",
    isActive: true,
    sortOrder: 3,
  },
];

function ArrowIcon({ direction, className }: { direction: "left" | "right"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <path
        d={direction === "left" ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function HeroSlider({ banners = BANNERS }: { banners?: Banner[] }) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  const activeBanners = useMemo(
    () => banners.filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    [banners]
  );

  if (activeBanners.length === 0) return null;

  return (
    // The frame's height comes from this aspect-ratio, never from the image —
    // every slide fills the same fixed box via object-cover.
    <div className="aabriha-hero-slider relative aspect-4/5 w-full overflow-hidden sm:aspect-16/7">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={reducedMotion ? 0 : 600}
        autoplay={reducedMotion ? false : { delay: 6000, disableOnInteraction: true, pauseOnMouseEnter: true }}
        loop
        className="h-full w-full"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {activeBanners.map((banner, index) => {
          const position = banner.objectPosition ?? "center center";
          return (
            <SwiperSlide key={banner.id} className="relative h-full w-full">
              <picture>
                {banner.mobileImage && <source media="(max-width: 639px)" srcSet={banner.mobileImage} />}
                <img
                  src={banner.desktopImage}
                  alt={banner.titleEn}
                  style={{ objectPosition: position }}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              </picture>
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent sm:bg-linear-to-r sm:from-black/80 sm:via-black/30 sm:via-40% sm:to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 sm:bottom-auto sm:left-0 sm:top-1/2 sm:max-w-md sm:-translate-y-1/2 sm:p-14">
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-strong">
                  New
                </span>
                <h2 className="text-2xl font-semibold text-white drop-shadow-sm sm:text-4xl">{banner.titleEn}</h2>
                <p className="text-sm text-white/90 drop-shadow-sm sm:text-base">{banner.subtitleEn}</p>
                <Link
                  href={banner.ctaUrl}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  {banner.ctaLabelEn}
                  <ArrowIcon direction="right" className="h-4 w-4" />
                </Link>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Compact rectangular controls, not default Swiper circles — desktop only,
          swipe + pagination already cover mobile. */}
      <div className="absolute right-4 top-4 z-10 hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => swiperRef.current?.slidePrev()}
          className="group flex h-9 w-9 items-center justify-center rounded-md border border-white/30 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-black/50"
        >
          <ArrowIcon direction="left" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => swiperRef.current?.slideNext()}
          className="group flex h-9 w-9 items-center justify-center rounded-md border border-white/30 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-black/50"
        >
          <ArrowIcon direction="right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Custom progress-style pagination — replaces Swiper's default dots */}
      <div
        role="tablist"
        aria-label="Slides"
        className="absolute bottom-4 right-4 z-10 flex gap-1.5 sm:bottom-6 sm:right-6"
      >
        {activeBanners.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Go to slide ${index + 1}: ${banner.titleEn}`}
            onClick={() => swiperRef.current?.slideToLoop(index)}
            className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              index === activeIndex ? "w-8 bg-primary" : "w-4 bg-white/55 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
