"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { subscribeNewsletter } from "@/lib/catalog";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await subscribeNewsletter(email.trim());
      toast.success("Subscribed! Thanks for joining.");
      setEmail("");
    } catch {
      toast.error("Couldn't subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex max-w-sm flex-col gap-2 lg:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        disabled={submitting}
        className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/50 outline-none focus-visible:outline-2 focus-visible:outline-white disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={submitting}
        className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-primary-strong hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
