/** Recommended pixel dimensions for site images — match layout to avoid cropping surprises. */

export type ImageUploadSpec = {
  id: string;
  label: string;
  width: number;
  height: number;
  aspectLabel: string;
  formats: string;
  maxMb: number;
  /** Extra line for document-style uploads */
  note?: string;
};

export const IMAGE_UPLOAD_SPECS = {
  heroBanner: {
    id: "hero-banner",
    label: "Hero banner (homepage carousel)",
    width: 1920,
    height: 960,
    aspectLabel: "2∶1 landscape",
    formats: "JPG, PNG, or WebP",
    maxMb: 5,
  },
  blogCover: {
    id: "blog-cover",
    label: "Blog cover image",
    width: 1600,
    height: 900,
    aspectLabel: "16∶9 landscape",
    formats: "JPG, PNG, or WebP",
    maxMb: 5,
  },
  blogOg: {
    id: "blog-og",
    label: "Social share image (Open Graph)",
    width: 1200,
    height: 630,
    aspectLabel: "1.91∶1 (WhatsApp / Facebook)",
    formats: "JPG, PNG, or WebP",
    maxMb: 5,
  },
  aboutPortrait: {
    id: "about-portrait",
    label: "About page leadership portrait",
    width: 440,
    height: 550,
    aspectLabel: "4∶5 portrait",
    formats: "JPG or PNG",
    maxMb: 4,
    note: "Displayed at 220×275px on /about — use a sharp head-and-shoulders photo.",
  },
  homeSupporterPortrait: {
    id: "home-supporter",
    label: "Homepage event supporter portrait",
    width: 800,
    height: 1000,
    aspectLabel: "4∶5 portrait",
    formats: "JPG or PNG",
    maxMb: 4,
    note: "Place file in public/home/ (see path in admin or codebase).",
  },
  odwSquadPortrait: {
    id: "odw-squad",
    label: "Outer Delhi Warriors squad portrait",
    width: 660,
    height: 880,
    aspectLabel: "3∶4 portrait",
    formats: "JPG or PNG",
    maxMb: 4,
    note: "Place file in public/home/odw/ — shown in squad grid.",
  },
  registrationPlayerPhoto: {
    id: "registration-player-photo",
    label: "Player photo",
    width: 800,
    height: 1000,
    aspectLabel: "4∶5 portrait",
    formats: "JPG, PNG, or WebP",
    maxMb: 4,
    note: "Recent head-and-shoulders or full-length cricket photo — optional but helps scouts.",
  },
  registrationIdScan: {
    id: "registration-id",
    label: "Government ID scan / photo",
    width: 1200,
    height: 1600,
    aspectLabel: "portrait or A4 document",
    formats: "JPG, PNG, WebP, or PDF",
    maxMb: 4,
    note: "Minimum 1000px on the longest side so text stays readable.",
  },
  registrationPaymentProof: {
    id: "registration-payment",
    label: "Payment proof screenshot",
    width: 1080,
    height: 1920,
    aspectLabel: "phone screenshot",
    formats: "JPG, PNG, or WebP",
    maxMb: 4,
    note: "Full screenshot of UPI / bank confirmation — at least 800px wide.",
  },
} as const satisfies Record<string, ImageUploadSpec>;

export type ImageUploadSpecKey = keyof typeof IMAGE_UPLOAD_SPECS;

export function formatImageUploadSpec(key: ImageUploadSpecKey): string {
  const s = IMAGE_UPLOAD_SPECS[key];
  const size = `${s.width}×${s.height}px`;
  const base = `Exact size: ${size} (${s.aspectLabel}) · ${s.formats} · max ${s.maxMb} MB`;
  return "note" in s && s.note ? `${base}. ${s.note}` : base;
}

export function formatImageUploadSpecShort(key: ImageUploadSpecKey): string {
  const s = IMAGE_UPLOAD_SPECS[key];
  return `${s.width}×${s.height}px · ${s.aspectLabel}`;
}
