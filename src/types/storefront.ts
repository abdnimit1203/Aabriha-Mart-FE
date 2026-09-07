export interface HeroBanner {
  _id: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  ctaLabelBn: string;
  ctaLabelEn: string;
  ctaUrl: string;
  desktopImage: string;
  mobileImage?: string;
  objectPosition?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Promotion {
  _id: string;
  image: string;
  mobileImage?: string;
  titleBn?: string;
  titleEn?: string;
  descriptionBn?: string;
  descriptionEn?: string;
  ctaLabelBn?: string;
  ctaLabelEn?: string;
  ctaUrl: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
}

export interface Announcement {
  enabled: boolean;
  messageBn: string;
  messageEn: string;
  url?: string;
  linkLabel?: string;
  marquee: boolean;
}

export interface MarketingSettings {
  facebookPixelEnabled: boolean;
  facebookPixelId: string;
}

export interface PaymentSettings {
  bkashEnabled: boolean;
  bkashQrImage?: string;
  nagadEnabled: boolean;
  nagadQrImage?: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  quote: string;
  rating: number;
  photo?: string;
  isActive: boolean;
  sortOrder: number;
}

// Image-only by design — no title/description/CTA-label. The image is the
// whole popup; ctaUrl (if set) just makes the image itself a link.
export interface WelcomePopup {
  enabled: boolean;
  image: string;
  ctaUrl: string;
}
