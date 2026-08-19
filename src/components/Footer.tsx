import Link from "next/link";
import { FaFacebook, FaInstagram } from "react-icons/fa";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/offers", label: "Offers" },
];

export function Footer() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const address = process.env.NEXT_PUBLIC_CONTACT_ADDRESS;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const facebook = process.env.NEXT_PUBLIC_FACEBOOK_URL;
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const hasSocial = Boolean(facebook || instagram);
  const hasContact = Boolean(email || address || whatsapp);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <span className="font-logo text-xl font-normal tracking-wide">Aabriha Mart</span>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            সহজ, দ্রুত ও নির্ভরযোগ্য অনলাইন শপিং — পোশাক, জুতা, ব্যাগ ও ইলেকট্রনিক্স, প্রতিদিনের বাংলাদেশের জন্য।
          </p>
          {hasSocial && (
            <div className="mt-4 flex gap-3">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary-strong">
                  <FaFacebook className="h-5 w-5" />
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary-strong">
                  <FaInstagram className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold">Shop</p>
          <ul className="mt-3 space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {hasContact && (
          <div>
            <p className="text-sm font-semibold">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {address && <li>{address}</li>}
              {whatsapp && <li>WhatsApp: {whatsapp}</li>}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-foreground">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Aabriha Mart. All rights reserved.
      </div>
    </footer>
  );
}
