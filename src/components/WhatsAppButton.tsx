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
              initial={{ opacity: 0, y: 12, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.7 }}
              transition={{ duration: 0.18, delay: 0.05 }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-strong text-white shadow-lg transition-transform hover:scale-105"
            >
              <FaPhoneVolume className="h-4.5 w-4.5" />
            </motion.a>
            <motion.a
              key="whatsapp"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              initial={{ opacity: 0, y: 12, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
            >
              <FaWhatsapp className="h-5 w-5" />
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
        <AnimatePresence initial={false}>
          <motion.span
            key={open ? "close" : "chat"}
            initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <FaCommentDots className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
