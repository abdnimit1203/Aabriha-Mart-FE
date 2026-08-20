import { Header } from "@/components/Header";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { WelcomePopup } from "@/components/WelcomePopup";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    // min-w-0: without it, a flex item defaults to its content's intrinsic
    // width, which lets wide children (carousels, tables) blow past any
    // max-width constraint and cause horizontal overflow on narrow screens.
    // pb-14: clears the fixed mobile bottom nav, which only this section has.
    <div className="flex min-w-0 flex-1 flex-col pb-14 sm:pb-0">
      <AnnouncementBar />
      <Header />
      <div className="min-w-0 flex-1">{children}</div>
      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
      <WelcomePopup />
    </div>
  );
}
