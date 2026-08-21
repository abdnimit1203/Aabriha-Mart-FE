"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProductImage } from "@/types/catalog";
import { ProductImageLightbox } from "@/components/ProductImageLightbox";
import { ZoomInIcon } from "@/components/icons";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label="View full-size image"
        className="group relative block aspect-square w-full overflow-hidden rounded-2xl border border-border bg-surface"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active.url + activeIndex}
            src={active.url}
            alt={active.alt ?? productName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
        <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <ZoomInIcon className="h-3.5 w-3.5" />
          Zoom
        </span>
      </button>

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

      {lightboxOpen && (
        <ProductImageLightbox
          images={images}
          initialIndex={activeIndex}
          productName={productName}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
