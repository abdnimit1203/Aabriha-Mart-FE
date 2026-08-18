import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aabriha Mart",
  description: "Clothing, shoes, bags & electronics — Aabriha Mart",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground pb-14 sm:pb-0">
        <Providers>
          <Header />
          {/* min-w-0: without it, a flex item defaults to its content's intrinsic
              width, which lets wide children (carousels, tables) blow past any
              max-width constraint and cause horizontal overflow on narrow screens. */}
          <div className="min-w-0 flex-1">{children}</div>
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
