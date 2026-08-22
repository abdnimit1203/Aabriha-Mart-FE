import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Privacy Policy — Aabriha Mart",
  description: "How Aabriha Mart collects, uses, and protects your information.",
};

const LAST_UPDATED = "22 August 2026";

export default function PrivacyPolicyPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Privacy Policy</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="prose-sm mt-8 space-y-8 text-sm leading-relaxed text-foreground sm:text-base">
        <section>
          <h2 className="text-lg font-semibold">1. Who we are</h2>
          <p className="mt-2 text-muted-foreground">
            Aabriha Mart (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates this website, selling clothing, shoes, bags, and electronics to
            customers in Bangladesh. This policy explains what information we collect when you use the site, why we
            collect it, and how it&apos;s handled.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Information we collect</h2>
          <p className="mt-2 text-muted-foreground">When you create an account or place an order, we collect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Your username, email address, and phone number</li>
            <li>Your delivery address (division, district, area, and detailed address)</li>
            <li>Your order history and the products you&apos;ve purchased</li>
            <li>A profile photo, if you choose to add one</li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            Signing in with Google shares only what Google provides at sign-in (your name, email, and profile photo);
            we ask you to add a phone number afterward since checkout needs one regardless of how you signed up.
          </p>
          <p className="mt-2 text-muted-foreground">
            We do not collect or store your card details. Card payments are processed directly by Stripe — see
            Section 5.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. How we use your information</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>To create and manage your account, and to verify your identity when you sign in</li>
            <li>To process, deliver, and provide support for your orders</li>
            <li>To calculate delivery charges based on your location and order weight</li>
            <li>To confirm your order by phone before it ships</li>
            <li>To let our support team respond if you contact us</li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            We do not sell your information to third parties, and we do not currently send marketing emails or SMS.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Cookies and local storage</h2>
          <p className="mt-2 text-muted-foreground">
            We use your browser&apos;s local storage for functional purposes only — remembering your cart contents
            between visits, whether you&apos;ve dismissed the announcement bar or welcome popup, and interface
            preferences like a collapsed sidebar. None of this is used for advertising or tracking you across other
            websites.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Third parties we work with</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Firebase (Google)</span> — handles account sign-in
              (email/password and Google Sign-In). We never see or store your password.
            </li>
            <li>
              <span className="font-medium text-foreground">Stripe</span> — processes card payments directly; your
              card details go straight to Stripe and never touch our servers.
            </li>
            <li>
              <span className="font-medium text-foreground">ImageKit</span> — hosts product and profile images.
            </li>
            <li>
              <span className="font-medium text-foreground">bKash / Nagad</span> — if you pay via bKash or Nagad, that
              payment happens directly between you and the provider; you send us a transaction ID for verification.
            </li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            A summary of new orders (item, amount, delivery address) may be sent to our own staff via Telegram so
            orders can be processed promptly — this is an internal notification, not a data sale or third-party
            marketing use.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. How long we keep your data</h2>
          <p className="mt-2 text-muted-foreground">
            We keep your account and order history for as long as your account remains active, so you can view past
            orders and we can handle any warranty, return, or support request related to them.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Your choices</h2>
          <p className="mt-2 text-muted-foreground">
            You can update your profile details, phone number, and delivery address at any time from{" "}
            <span className="font-medium text-foreground">My Account</span>. If you&apos;d like your account or data
            removed, contact us using the details below and we&apos;ll act on it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Changes to this policy</h2>
          <p className="mt-2 text-muted-foreground">
            We may update this policy as the site changes. The &quot;Last updated&quot; date at the top will always
            reflect the most recent version.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">9. Contact us</h2>
          <p className="mt-2 text-muted-foreground">
            Questions about this policy or your data?{" "}
            {email ? (
              <>
                Email us at{" "}
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
      </div>
    </main>
  );
}
