"use client";

import { useState } from "react";
import { ProductImage } from "@/types/catalog";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-surface text-sm text-muted-foreground">
        No image available
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={active.url} alt={active.alt ?? productName} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === activeIndex}
              className={`aspect-square overflow-hidden rounded-lg border transition-colors ${
                index === activeIndex ? "border-primary-strong" : "border-border hover:border-primary"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
