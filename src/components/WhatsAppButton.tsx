"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaWhatsapp, FaCommentDots } from "react-icons/fa";
import { FaPhoneVolume } from "react-icons/fa6";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";
import { CloseIcon } from "@/components/icons";

const GREETING = "Hi! I'm reaching out from the Aabriha Mart website.";

// Hidden entirely when no number is configured. One floating "contact" FAB
// that expands into WhatsApp/Call options, rather than two permanent
// floating buttons competing for the same corner — a Tawk.to widget may
// join this later.
export function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const [open, setOpen] = useState(false);
  const rootRef = useDismissableOverlay<HTMLDivElement>({ open, onDismiss: () => setOpen(false) });

  if (!number) return null;

  const whatsappHref = `https://wa.me/${number}?text=${encodeURIComponent(GREETING)}`;
  const callHref = `tel:${number}`;

  return (
    <div ref={rootRef} className="fixed bottom-20 right-4 z-30 flex flex-col items-end gap-3 sm:bottom-6">
      <AnimatePresence>
        {open && (
          <>
            <motion.a
              key="call"
              href={callHref}
              aria-label="Call us"
              initial={{ opacity: 0, y: 18, scale: 0.4 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.4, transition: { duration: 0.1, ease: "easeIn" } }}
              transition={{ type: "spring", stiffness: 500, damping: 24, delay: 0.04 }}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-sky-400/80 bg-black shadow-[0_0_10px_rgba(56,189,248,0.7)] transition-transform hover:scale-105"
            >
              <span
                className="absolute inset-0 animate-pulse rounded-full bg-sky-400/40 blur-md"
                aria-hidden="true"
              />
              <FaPhoneVolume className="relative h-4.5 w-4.5 text-sky-300 drop-shadow-[0_0_6px_rgba(56,189,248,0.95)]" />
            </motion.a>
            <motion.a
              key="whatsapp"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              initial={{ opacity: 0, y: 18, scale: 0.4 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.4, transition: { duration: 0.1, ease: "easeIn" } }}
              transition={{ type: "spring", stiffness: 500, damping: 24 }}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/80 bg-[#25D366] shadow-[0_0_10px_rgba(37,211,102,0.7)] transition-transform hover:scale-105"
            >
              <span
                className="absolute inset-0 animate-pulse rounded-full bg-emerald-300/40 blur-md"
                aria-hidden="true"
              />
              <FaWhatsapp className="relative h-5 w-5 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
            </motion.a>
          </>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close contact options" : "Contact us"}
        aria-expanded={open}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={open ? "close" : "chat"}
            initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center justify-center"
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <FaCommentDots className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
