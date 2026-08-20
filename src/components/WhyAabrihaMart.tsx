import { FaTruck, FaPhoneVolume, FaShieldHalved, FaHeadset } from "react-icons/fa6";

const VALUES = [
  { icon: FaTruck, title: "Cash on Delivery", description: "Available across Bangladesh" },
  { icon: FaPhoneVolume, title: "Order Confirmation", description: "We call before dispatch" },
  { icon: FaShieldHalved, title: "Secure Payments", description: "bKash / Nagad / Stripe" },
  { icon: FaHeadset, title: "Customer Support", description: "Easy order assistance" },
];

export function WhyAabrihaMart() {
  return (
    <section className="mt-16">
      <h2 className="text-lg font-semibold">Why Aabriha Mart</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {VALUES.map((value) => (
          <div key={value.title} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center">
            <value.icon className="h-6 w-6 text-primary-strong" />
            <p className="text-sm font-medium">{value.title}</p>
            <p className="text-xs text-muted-foreground">{value.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
