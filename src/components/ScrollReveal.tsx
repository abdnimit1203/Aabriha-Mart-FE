"use client";

import { motion } from "framer-motion";

/** Fade + slight rise as a section enters the viewport, once — opacity and
 * transform only (compositor-friendly, no layout/paint cost), and the
 * IntersectionObserver behind `whileInView` disconnects after the first
 * trigger (`once: true`) so it never re-fires or keeps costing anything
 * on subsequent scrolls. Used to reveal whole sections/grids, not individual
 * product cards — one observer per section keeps this cheap at any catalog size. */
export function ScrollReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
