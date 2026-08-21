import { FaTruck, FaPhoneVolume, FaShieldHalved, FaHeadset } from "react-icons/fa6";
import { ScrollReveal } from "@/components/ScrollReveal";

const VALUES = [
  { icon: FaTruck, title: "Cash on Delivery", description: "Available across Bangladesh" },
  { icon: FaPhoneVolume, title: "Order Confirmation", description: "We call before dispatch" },
  { icon: FaShieldHalved, title: "Secure Payments", description: "bKash / Nagad / Stripe" },
  { icon: FaHeadset, title: "Customer Support", description: "Easy order assistance" },
];

// One deliberate strip — a shared surface with dividers between items —
// rather than four separately-bordered cards that read as four unrelated
// widgets scattered on the page.
export function WhyAabrihaMart() {
  return (
    <section className="mt-14 sm:mt-20">
      <ScrollReveal>
        <div className="grid grid-cols-2 gap-y-6 rounded-3xl border border-border bg-surface px-6 py-8 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-border sm:px-4">
          {VALUES.map((value) => (
            <div key={value.title} className="flex flex-col items-center gap-2 px-2 text-center sm:px-6">
              <value.icon className="h-5 w-5 text-primary-strong" />
              <p className="text-sm font-medium">{value.title}</p>
              <p className="text-xs text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
