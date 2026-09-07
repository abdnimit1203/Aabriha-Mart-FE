"use client";

import Link from "next/link";
import { FaShapes } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import { Category } from "@/types/catalog";
import { ScrollReveal } from "@/components/ScrollReveal";
import { expandCategorySelection } from "@/lib/categoryTree";

/** Compact circular-photo row ("Shop by Categories") — each category's own
 * photo cropped into a circle, with a generic placeholder icon standing in
 * for any category the admin hasn't uploaded a photo for yet, rather than
 * leaving a blank/broken circle.
 *
 * A continuously auto-scrolling marquee (delay: 0 autoplay + free mode),
 * not a one-at-a-time paginated carousel — shows as many circles as fit at
 * once, drifting left continuously, and is still fully grabbable/draggable
 * by touch or mouse (autoplay pauses while dragging, resumes after). Loop
 * only kicks in once there's enough content for a seamless repeat; a short
 * category list just sits still, left-aligned, same as a plain flex row. */
export function CategoryCircles({ categories, allCategories }: { categories: Category[]; allCategories: Category[] }) {
  if (categories.length === 0) return null;

  const loop = categories.length > 4;

  return (
    <section className="mt-14 sm:mt-20">
      <ScrollReveal>
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Shop by Categories</h2>
          <p className="mt-1 text-sm text-muted-foreground">Find exactly what you&apos;re looking for.</p>
        </div>

        <Swiper
          modules={loop ? [Autoplay, FreeMode] : [FreeMode]}
          slidesPerView="auto"
          spaceBetween={20}
          freeMode={{ enabled: true, momentum: false }}
          grabCursor
          loop={loop}
          speed={loop ? 4000 : 300}
          autoplay={loop ? { delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
          className="mt-6! px-1! py-2!"
        >
          {categories.map((category) => {
            const ids = expandCategorySelection([category._id], allCategories);
            return (
              <SwiperSlide key={category._id} className="w-20! sm:w-24!">
                <Link
                  href={`/products?category=${ids.join(",")}`}
                  className="group flex flex-col items-center gap-2 text-center"
                  draggable={false}
                >
                  <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-surface shadow-sm transition-shadow group-hover:shadow-md sm:h-20 sm:w-20">
                    {category.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={category.image}
                        alt=""
                        draggable={false}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <FaShapes className="h-6 w-6 text-primary-strong/60" aria-hidden />
                    )}
                  </span>
                  <span className="line-clamp-2 text-xs font-medium sm:text-sm">{category.name}</span>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </ScrollReveal>
    </section>
  );
}
