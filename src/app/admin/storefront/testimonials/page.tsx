"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getTestimonials } from "@/lib/catalog";
import { deleteTestimonial } from "@/lib/admin/testimonials";
import { Testimonial } from "@/types/storefront";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { TrashIcon } from "@/components/icons";
import { confirmToast } from "@/lib/confirmToast";

export default function AdminTestimonialsPage() {
  const { getIdToken } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);

  const load = useCallback(() => {
    getTestimonials()
      .then((res) => setTestimonials([...res].sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(() => setTestimonials([]));
  }, []);

  useEffect(load, [load]);

  async function handleDelete(testimonial: Testimonial) {
    if (!(await confirmToast(`Delete this testimonial? This cannot be undone.`))) return;
    const idToken = await getIdToken();
    if (!idToken) return;
    try {
      await deleteTestimonial(idToken, testimonial._id);
      toast.success("Testimonial deleted.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete this testimonial.");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Testimonials"
        description={'The "What Our Customers Say" section on the homepage.'}
        actions={
          <Link href="/admin/storefront/testimonials/new" className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong">
            New Testimonial
          </Link>
        }
      />

      {!testimonials ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : testimonials.length === 0 ? (
        <p className="text-sm text-muted-foreground">No testimonials yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 font-medium">Customer</th>
              <th className="pb-2 font-medium">Quote</th>
              <th className="pb-2 font-medium">Rating</th>
              <th className="pb-2 font-medium">Sort</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {testimonials.map((testimonial) => (
              <tr key={testimonial._id} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-3">
                    {testimonial.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={testimonial.photo} alt="" className="h-9 w-9 rounded-full border border-border object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary-strong">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="text-sm font-medium">{testimonial.name}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 max-w-xs truncate text-sm text-muted-foreground">{testimonial.quote}</td>
                <td className="py-2.5 pr-3 text-sm text-muted-foreground">{testimonial.rating}/5</td>
                <td className="py-2.5 pr-3 text-sm text-muted-foreground">{testimonial.sortOrder}</td>
                <td className="py-2.5 pr-3">
                  {testimonial.isActive ? (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                  ) : (
                    <span className="rounded bg-black/5 px-2 py-0.5 text-xs font-medium text-muted-foreground">Hidden</span>
                  )}
                </td>
                <td className="py-2.5 text-right">
                  <Link href={`/admin/storefront/testimonials/${testimonial._id}/edit`} className="mr-3 text-sm text-primary-strong hover:underline">
                    Edit
                  </Link>
                  <button type="button" onClick={() => handleDelete(testimonial)} aria-label="Delete testimonial" className="text-danger hover:opacity-70">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
