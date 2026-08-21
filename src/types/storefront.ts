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

// Image-only by design — no title/description/CTA-label. The image is the
// whole popup; ctaUrl (if set) just makes the image itself a link.
export interface WelcomePopup {
  enabled: boolean;
  image: string;
  ctaUrl: string;
}
