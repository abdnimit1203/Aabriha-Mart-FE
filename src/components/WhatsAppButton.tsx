"use client";

import { FaWhatsapp } from "react-icons/fa";

// Hidden entirely when no number is configured — floating chat entry point
// for now; a Tawk.to widget may replace/join this later.
export function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 sm:bottom-6"
    >
      <FaWhatsapp className="h-6 w-6" />
    </a>
  );
}
