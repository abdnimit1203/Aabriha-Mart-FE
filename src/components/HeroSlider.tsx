"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export interface Banner {
  imageUrl: string;
  alt: string;
  label: string;
  categorySlug: string;
}

const BANNERS: Banner[] = [
  {
    imageUrl: "https://ik.imagekit.io/abdnimit/Model_wearing_women.jpeg",
    alt: "Women's fashion",
    label: "Women's Collection",
    categorySlug: "womens-dresses",
  },
  {
    imageUrl: "https://ik.imagekit.io/abdnimit/Model_wearing_men%20(1).jpeg",
    alt: "Men's fashion",
    label: "Men's Collection",
    categorySlug: "mens-shirts",
  },
  {
    imageUrl: "https://ik.imagekit.io/abdnimit/Model_wearing_shoe-bag.jpeg",
    alt: "Shoes and bags",
    label: "Shoes & Bags",
    categorySlug: "shoes",
  },
];

export function HeroSlider() {
  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation
      loop
      className="aabriha-hero-slider"
    >
      {BANNERS.map((banner) => (
        <SwiperSlide key={banner.categorySlug}>
          <Link
            href={`/categories/${banner.categorySlug}`}
            className="relative block aspect-[16/9] w-full sm:aspect-[21/9]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.imageUrl} alt={banner.alt} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 sm:p-10">
              <span className="inline-block rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">
                {banner.label}
              </span>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
