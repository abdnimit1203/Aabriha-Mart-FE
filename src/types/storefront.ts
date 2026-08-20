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

export interface WelcomePopup {
  enabled: boolean;
  image: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  ctaLabel: string;
  ctaUrl: string;
}
