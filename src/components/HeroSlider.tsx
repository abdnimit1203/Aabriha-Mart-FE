"use client";

import { useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export interface Banner {
  imageUrl: string;
  alt: string;
  eyebrow: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  categorySlug: string;
}

const BANNERS: Banner[] = [
  {
    imageUrl: "https://ik.imagekit.io/abdnimit/Model_wearing_women.jpeg",
    alt: "Women's fashion",
    eyebrow: "New Arrivals",
    headline: "Women's Collection",
    subtext: "Elegant, everyday-ready fits.",
    ctaLabel: "Shop Women",
    categorySlug: "womens-dresses",
  },
  {
    imageUrl: "https://ik.imagekit.io/abdnimit/Model_wearing_panjabi_for_banner_202608190117.jpeg",
    alt: "Men's fashion",
    eyebrow: "Just In",
    headline: "Men's Collection",
    subtext: "Sharp fits, built for every day.",
    ctaLabel: "Shop Men",
    categorySlug: "mens-shirts",
  },
  {
    imageUrl: "https://ik.imagekit.io/abdnimit/Model_wearing_shoe-bag.jpeg",
    alt: "Shoes and bags",
    eyebrow: "Complete The Look",
    headline: "Shoes & Bags",
    subtext: "Finish the outfit, head to toe.",
    ctaLabel: "Shop Now",
    categorySlug: "shoes",
  },
];

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} className="h-5 w-5" aria-hidden>
      <path
        d={direction === "left" ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroSlider() {
  const swiperRef = useRef<SwiperClass | null>(null);

  return (
    <div className="aabriha-hero-slider relative">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {BANNERS.map((banner) => (
          <SwiperSlide key={banner.categorySlug}>
            <div className="relative aspect-4/5 w-full sm:aspect-16/8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.imageUrl}
                alt={banner.alt}
                className="h-full w-full object-cover object-[80%_center]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent sm:bg-linear-to-r sm:from-black/60 sm:via-black/10 sm:to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 sm:bottom-auto sm:left-0 sm:top-1/2 sm:max-w-md sm:-translate-y-1/2 sm:p-12">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-strong">
                  {banner.eyebrow}
                </span>
                <h2 className="text-2xl font-semibold text-white sm:text-4xl">{banner.headline}</h2>
                <p className="text-sm text-white/85 sm:text-base">{banner.subtext}</p>
                <Link
                  href={`/categories/${banner.categorySlug}`}
                  className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  {banner.ctaLabel}
                  <ArrowIcon direction="right" />
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => swiperRef.current?.slidePrev()}
        className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-foreground shadow-md transition-transform hover:scale-105 sm:flex"
      >
        <ArrowIcon direction="left" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => swiperRef.current?.slideNext()}
        className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-foreground shadow-md transition-transform hover:scale-105 sm:flex"
      >
        <ArrowIcon direction="right" />
      </button>
    </div>
  );
}
