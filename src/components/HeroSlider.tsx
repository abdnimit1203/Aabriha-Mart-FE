"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { ArrowIcon } from "@/components/icons";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

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
    subtitleEn:
      "Elegant, everyday-ready fits made for real life — breathable fabrics, flattering cuts, and prices that make sense for daily wear.",
    ctaLabelBn: "কেনাকাটা করুন",
    ctaLabelEn: "Shop Women",
    ctaUrl: "/categories/womens-wear",
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
    subtitleEn:
      "Sharp fits, built for every day — from the office to the mosque to weekend errands, without ever feeling stiff or overdressed.",
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
    subtitleEn:
      "Finish the outfit, head to toe — durable, comfortable shoes and bags built to keep up with wherever your day takes you.",
    ctaLabelBn: "এখনই কিনুন",
    ctaLabelEn: "Shop Now",
    ctaUrl: "/categories/shoes",
    desktopImage: "https://ik.imagekit.io/abdnimit/Model_wearing_shoe-bag.jpeg",
    objectPosition: "center center",
    isActive: true,
    sortOrder: 3,
  },
];

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
    // Fixed height comes from this aspect-ratio rather than content, so every
    // slide (text-heavy or not) sits in the same box without layout jumps.
    <div className="aabriha-hero-slider relative aspect-4/5 w-full overflow-hidden bg-surface md:aspect-21/9">
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
            <SwiperSlide
              key={banner.id}
              className="relative! h-full w-full md:grid! md:grid-cols-2! md:bg-surface"
            >
              {/* Text block: below md this overlays the full-bleed image below
                  (absolute, white text, drop-shadow) — phones only, since
                  tablets already have room for a two-column split. At md+ it
                  becomes a normal grid cell, stretched to the row's full
                  height (so it can vertically center its own content) on its
                  own light background instead. */}
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-3 p-6 md:static md:h-full md:justify-center md:gap-4 md:px-14 md:py-0">
                <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-strong md:bg-primary/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-strong" aria-hidden />
                  New Arrivals
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl md:text-4xl md:text-foreground md:drop-shadow-none lg:text-5xl">
                  {banner.titleEn}
                </h2>
                <p className="max-w-md text-sm text-white/90 drop-shadow-sm md:text-base md:text-muted-foreground md:drop-shadow-none">
                  {banner.subtitleEn}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                  <Link
                    href={banner.ctaUrl}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-primary px-4 py-2 text-xs font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.98] sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    {banner.ctaLabelEn}
                    <ArrowIcon direction="right" className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/offers"
                    className="inline-flex items-center whitespace-nowrap rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:px-5 sm:py-2.5 sm:text-sm md:border-border md:bg-background md:text-foreground md:backdrop-blur-none md:hover:bg-surface"
                  >
                    Explore Deals
                  </Link>
                </div>
              </div>

              {/* Image layer: full-bleed background below md (focal point via
                  objectPosition, same as before), a normal right-column box
                  at md+. */}
              <div className="absolute inset-0 z-0 md:relative md:inset-auto md:h-full">
                <picture>
                  {banner.mobileImage && <source media="(max-width: 767px)" srcSet={banner.mobileImage} />}
                  <img
                    src={banner.desktopImage}
                    alt={banner.titleEn}
                    style={{ objectPosition: position }}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </picture>
              </div>

              {/* Darkening gradient so white overlay text stays readable —
                  below md only, since md+ text sits on its own light panel. */}
              <div className="absolute inset-0 z-0 bg-linear-to-t from-black/85 via-black/25 to-transparent md:hidden" />
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
          className="group flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
        >
          <ArrowIcon direction="left" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => swiperRef.current?.slideNext()}
          className="group flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
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
            className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
              index === activeIndex ? "w-8 bg-primary" : "w-4 bg-border hover:bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
