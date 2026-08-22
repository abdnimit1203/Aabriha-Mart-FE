import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Elegant serif for the "Aabriha Mart" wordmark specifically — not the body
// font, which stays Geist for readability.
const logoFont = Playfair_Display({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const DEVELOPER = {
  name: "Abdullah Ibne Ali",
  portfolio: "https://abdullah-ibne-ali.netlify.app",
  github: "https://github.com/abdnimit1203",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Aabriha Mart",
  description: "Clothing, shoes, bags & electronics — Aabriha Mart",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Aabriha Mart",
    description: "Clothing, shoes, bags & electronics — Aabriha Mart",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  // Credits the site to its developer for search engines — paired with the
  // JSON-LD `author`/`sameAs` below and the footer credit link, this is what
  // helps Google associate "Abdullah Ibne Ali" as an entity with this site.
  authors: [{ name: DEVELOPER.name, url: DEVELOPER.portfolio }],
  creator: DEVELOPER.name,
};

// Structured data (schema.org) so search engines can connect this site to
// its developer's other profiles via `sameAs` — the mechanism Google's
// Knowledge Graph uses to link an entity across pages it doesn't own.
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Aabriha Mart",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: {
    "@type": "Person",
    name: DEVELOPER.name,
    url: DEVELOPER.portfolio,
    sameAs: [DEVELOPER.portfolio, DEVELOPER.github],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${logoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
