import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Terms of Service — Aabriha Mart",
  description: "The terms that govern shopping, orders, and returns at Aabriha Mart.",
};

const LAST_UPDATED = "22 August 2026";

export default function TermsPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Terms of Service</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground sm:text-base">
        <section>
          <h2 className="text-lg font-semibold">1. About these terms</h2>
          <p className="mt-2 text-muted-foreground">
            These terms govern your use of Aabriha Mart and any order you place with us. By using the site or
            placing an order, you agree to them. If anything here is unclear, contact us before ordering — see
            Section 10.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Orders and acceptance</h2>
          <p className="mt-2 text-muted-foreground">
            Placing an order is a request to buy, not an automatic sale — your order starts as{" "}
            <span className="font-medium text-foreground">pending</span> and we confirm it before it&apos;s
            processed. We reserve the right to decline or cancel an order (for example, if an item is actually out
            of stock, or a price/listing was mistaken), in which case we&apos;ll let you know and refund any
            payment already made.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Payment methods</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Cash on Delivery (COD)</span> — pay the courier when
              your order arrives. Please inspect your package before accepting it from the courier, and let us
              know immediately if anything looks wrong.
            </li>
            <li>
              <span className="font-medium text-foreground">bKash / Nagad</span> — send payment via the app and
              share the transaction ID with us; we verify it manually before processing your order.
            </li>
            <li>
              <span className="font-medium text-foreground">Card (Stripe)</span> — processed securely by Stripe; we
              verify successful payment directly with Stripe before confirming your order.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Delivery</h2>
          <p className="mt-2 text-muted-foreground">
            We deliver nationwide across Bangladesh. Delivery charges are calculated automatically based on your
            delivery zone and the total weight of your order. We&apos;ll call to confirm your order before it
            ships.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Cancelling an order</h2>
          <p className="mt-2 text-muted-foreground">
            You can request cancellation any time before your order ships — contact us (Section 10) and
            we&apos;ll cancel it and reverse any payment taken. Once an order has shipped, it can no longer be
            cancelled; a Return (Section 6) is the equivalent option at that point.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Returns and refunds</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>You can request a return within 7 days of delivery — contact us to arrange it.</li>
            <li>
              We offer refunds only — we don&apos;t currently offer exchanges (swapping for a different size,
              color, or item).
            </li>
            <li>
              If the item arrived defective, damaged, or wasn&apos;t what you ordered, we cover the return
              shipping cost. For a change-of-mind return, return shipping is the customer&apos;s responsibility.
            </li>
            <li>Once we receive and approve a return, we process the refund within 7 business days.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Your account</h2>
          <p className="mt-2 text-muted-foreground">
            Keep your account details accurate and your login secure. You&apos;re responsible for activity on your
            account. If you believe someone else has accessed it, contact us right away.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Acceptable use</h2>
          <p className="mt-2 text-muted-foreground">
            Don&apos;t use Aabriha Mart for fraudulent orders, to abuse our return/refund process, or to interfere
            with the site&apos;s normal operation. We may suspend or close accounts that do.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">9. Liability and governing law</h2>
          <p className="mt-2 text-muted-foreground">
            We aim to describe our products accurately, but occasional errors (pricing, availability, description)
            can happen — we&apos;ll correct them and won&apos;t hold you to a mistaken price once we catch it.
            These terms are governed by the laws of Bangladesh.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">10. Contact us</h2>
          <p className="mt-2 text-muted-foreground">
            For orders, cancellations, returns, or any question about these terms:{" "}
            {email ? (
              <>
                email{" "}
                <a href={`mailto:${email}`} className="font-medium text-primary-strong hover:underline">
                  {email}
                </a>
                {whatsapp ? " or " : "."}
              </>
            ) : null}
            {whatsapp ? (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-strong hover:underline"
              >
                message us on WhatsApp
              </a>
            ) : null}
            {!email && !whatsapp ? "reach out through our WhatsApp or email listed in the footer." : "."}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">11. Changes to these terms</h2>
          <p className="mt-2 text-muted-foreground">
            We may update these terms as the store changes. The &quot;Last updated&quot; date at the top always
            reflects the current version.
          </p>
        </section>
      </div>
    </main>
  );
}
