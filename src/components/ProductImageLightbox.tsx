"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProductImage } from "@/types/catalog";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";
import { CloseIcon, ChevronIcon } from "@/components/icons";

const ZOOM_SCALE = 2;

/** Full-screen product image viewer: click/tap to zoom in place, drag to pan
 * while zoomed, prev/next between the product's other shots. `onTap` (not
 * onClick) so a drag gesture is never misread as a zoom toggle.
 *
 * Drag bounds are computed by hand (`dragBounds`) rather than passed as
 * `dragConstraints={frameRef}` — a ref-based constraint measures the image's
 * un-zoomed box against the frame, with no idea a `scale: 2` transform is
 * about to be applied, so whichever axis object-contain already leaves
 * touching the frame edge (which axis that is flips between a wide desktop
 * frame and a tall mobile one) gets clamped to ~0 range instead of the real
 * post-zoom overflow. Measuring the pre-zoom rect and doubling it ourselves
 * gives correct, symmetric bounds on both axes independent of orientation. */
export function ProductImageLightbox({
  images,
  initialIndex,
  productName,
  onClose,
}: {
  images: ProductImage[];
  initialIndex: number;
  productName: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [dragBounds, setDragBounds] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const rootRef = useDismissableOverlay<HTMLDivElement>({ open: true, onDismiss: onClose });

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  function go(delta: number) {
    setZoomed(false);
    setIndex((i) => (i + delta + images.length) % images.length);
  }

  function selectIndex(i: number) {
    setZoomed(false);
    setIndex(i);
  }

  function handleTap() {
    if (zoomed) {
      setZoomed(false);
      return;
    }
    const frame = frameRef.current;
    const img = imgRef.current;
    if (frame && img) {
      const frameRect = frame.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect(); // still un-zoomed here
      const overflowX = Math.max(0, (imgRect.width * ZOOM_SCALE - frameRect.width) / 2);
      const overflowY = Math.max(0, (imgRect.height * ZOOM_SCALE - frameRect.height) / 2);
      setDragBounds({ left: -overflowX, right: overflowX, top: -overflowY, bottom: overflowY });
    }
    setZoomed(true);
  }

  const active = images[index];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`${productName} images`}>
      <div className="absolute inset-0 bg-black/90" />

      <div ref={rootRef} className="relative flex max-h-full w-full max-w-4xl flex-col items-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-12 right-0 z-10 rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div ref={frameRef} className="relative flex h-[65vh] w-full items-center justify-center overflow-hidden rounded-2xl sm:h-[70vh]">
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-2 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <ChevronIcon className="h-5 w-5 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-2 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <ChevronIcon className="h-5 w-5" />
              </button>
            </>
          )}

          <AnimatePresence mode="wait">
            <motion.img
              key={active.url + index}
              ref={imgRef}
              src={active.url}
              alt={active.alt ?? productName}
              drag={zoomed}
              dragConstraints={dragBounds}
              dragElastic={0.05}
              dragMomentum={false}
              onTap={handleTap}
              initial={{ opacity: 0 }}
              animate={zoomed ? { opacity: 1, scale: ZOOM_SCALE } : { opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`max-h-full max-w-full touch-none object-contain select-none ${zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
            />
          </AnimatePresence>
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1">
            {images.map((image, i) => (
              <button
                key={image.url + i}
                type="button"
                onClick={() => selectIndex(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity ${
                  i === index ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
