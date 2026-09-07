"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTestimonials } from "@/lib/catalog";
import { Testimonial } from "@/types/storefront";
import { TestimonialForm } from "../../TestimonialForm";

export default function EditTestimonialPage() {
  const { id } = useParams<{ id: string }>();
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);

  useEffect(() => {
    getTestimonials().then(setTestimonials).catch(() => setTestimonials([]));
  }, []);

  if (!testimonials) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const testimonial = testimonials.find((t) => t._id === id);
  if (!testimonial) return <p className="text-sm text-danger">Testimonial not found.</p>;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Edit Testimonial</h2>
      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
