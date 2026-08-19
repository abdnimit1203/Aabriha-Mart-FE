import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/offers", label: "Offers" },
];

export function Footer() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const address = process.env.NEXT_PUBLIC_CONTACT_ADDRESS;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  // Social icons always show — real profile URLs aren't set up yet, so each
  // falls back to "#" rather than being hidden or pointing somewhere wrong.
  const facebook = process.env.NEXT_PUBLIC_FACEBOOK_URL || "#";
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";
  const linkedin = process.env.NEXT_PUBLIC_LINKEDIN_URL || "#";
  const twitter = process.env.NEXT_PUBLIC_TWITTER_URL || "#";
  const hasContact = Boolean(email || address || whatsapp);

  return (
    <footer className="bg-primary-strong text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white bg-white">
            <Image src="/logo.png" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
          </div>
          <span className="mt-3 block font-logo text-2xl font-normal tracking-wide">Aabriha Mart</span>
          <p className="mt-2 max-w-xs text-sm text-white/80">
            সহজ, দ্রুত ও নির্ভরযোগ্য অনলাইন শপিং — পোশাক, জুতা, ব্যাগ ও ইলেকট্রনিক্স, প্রতিদিনের বাংলাদেশের জন্য।
          </p>
          <div className="mt-4 flex gap-3">
            <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/80 hover:text-white">
              <FaFacebook className="h-5 w-5" />
            </a>
            <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/80 hover:text-white">
              <FaInstagram className="h-5 w-5" />
            </a>
            <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white/80 hover:text-white">
              <FaLinkedin className="h-5 w-5" />
            </a>
            <a href={twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-white/80 hover:text-white">
              <FaTwitter className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Shop</p>
          <ul className="mt-3 space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/80 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {hasContact && (
          <div>
            <p className="text-sm font-semibold">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {address && <li>{address}</li>}
              {whatsapp && <li>WhatsApp: {whatsapp}</li>}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-white">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-white/20 px-4 py-4 text-center text-xs text-white/70 sm:px-6">
        © {new Date().getFullYear()} Aabriha Mart. All rights reserved.
      </div>
    </footer>
  );
}
