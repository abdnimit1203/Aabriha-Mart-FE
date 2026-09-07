"use client";

import { FaStar, FaQuoteLeft } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowIcon } from "@/components/icons";
import { useCarouselNav } from "@/hooks/useCarouselNav";
import { Testimonial } from "@/types/storefront";

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <FaQuoteLeft className="h-5 w-5 shrink-0 text-primary/40" aria-hidden />
      <p className="mt-3 text-sm text-foreground/90">{t.quote}</p>
      <div className="mt-auto flex items-center gap-3 pt-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary-strong">
          {t.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            t.name.charAt(0).toUpperCase()
          )}
        </span>
        <div>
          <p className="text-sm font-medium">{t.name}</p>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <FaStar key={i} className={`h-3 w-3 ${i < t.rating ? "text-amber-400" : "text-border"}`} aria-hidden />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const { canGoPrev, canGoNext, goPrev, goNext, onSwiper, onSlideChange } = useCarouselNav();

  if (testimonials.length === 0) return null;

  // Looping only makes sense once there's more content than a single view
  // shows at once (3, at the widest breakpoint) — otherwise every "slide"
  // would just be the same set repeating.
  const loop = testimonials.length > 3;

  return (
    <section className="mt-14 sm:mt-20">
      <ScrollReveal>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">What Our Customers Say</h2>
          {!loop && (
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                aria-label="Previous testimonials"
                disabled={!canGoPrev}
                onClick={goPrev}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowIcon direction="left" className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next testimonials"
                disabled={!canGoNext}
                onClick={goNext}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowIcon direction="right" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="relative mt-8">
          <Swiper
            modules={[Autoplay]}
            loop={loop}
            autoplay={loop ? { delay: 4500, disableOnInteraction: true, pauseOnMouseEnter: true } : false}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-1!"
            onSwiper={onSwiper}
            onSlideChange={onSlideChange}
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t._id} className="py-1">
                <TestimonialCard t={t} />
              </SwiperSlide>
            ))}
          </Swiper>

          {loop && (
            <div className="mt-5 hidden justify-center gap-2 sm:flex">
              <button
                type="button"
                aria-label="Previous testimonials"
                onClick={goPrev}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-background"
              >
                <ArrowIcon direction="left" className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next testimonials"
                onClick={goNext}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-background"
              >
                <ArrowIcon direction="right" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
