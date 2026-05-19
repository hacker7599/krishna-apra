import { z } from "zod";
import { isSafeBannerCtaHref, isSafeGoogleMapsUrl } from "@/lib/safe-public-href";

const hexColor = z.string().regex(/^#([0-9a-fA-F]{6})$/, "Use #RRGGBB hex colour");

const ctaHrefMessage =
  "CTA link must be a same-site path (starting with /, not //) or https://… (http only for localhost).";

const ctaHrefCreate = z
  .string()
  .max(200)
  .optional()
  .refine((s) => s == null || s.trim() === "" || isSafeBannerCtaHref(s.trim()), { message: ctaHrefMessage });

const ctaHrefPatch = z
  .union([z.string().max(200), z.null()])
  .optional()
  .refine((s) => s === undefined || s === null || String(s).trim() === "" || isSafeBannerCtaHref(String(s).trim()), {
    message: ctaHrefMessage,
  });

export const teamCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  accentColor: hexColor,
  description: z.string().trim().max(500).optional().default(""),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional().default(true),
});

export const teamPatchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  city: z.string().trim().min(2).max(80).optional(),
  accentColor: hexColor.optional(),
  description: z.string().trim().max(500).optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

const imageUrl = z
  .string()
  .trim()
  .min(4)
  .refine(
    (u) => u.startsWith("/") || u.startsWith("https://"),
    "Image must be uploaded or use a path starting with / or https://",
  );

export const bannerCreateSchema = z.object({
  title: z.string().max(120).optional(),
  subtitle: z.string().max(200).optional(),
  imageUrl: imageUrl,
  ctaLabel: z.string().max(40).optional(),
  ctaHref: ctaHrefCreate,
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional().default(true),
});

export const bannerPatchSchema = z.object({
  title: z.string().trim().max(120).optional().nullable(),
  subtitle: z.string().trim().max(200).optional().nullable(),
  imageUrl: imageUrl.optional(),
  ctaLabel: z.string().trim().max(40).optional().nullable(),
  ctaHref: ctaHrefPatch,
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

const mapsUrlMessage = "Navigation link must be a Google Maps URL (https://maps.google.com, maps.app.goo.gl, goo.gl, …).";

const navigationUrl = z
  .string()
  .trim()
  .min(8)
  .max(2000)
  .refine((s) => isSafeGoogleMapsUrl(s), { message: mapsUrlMessage });

const navigationUrlOptionalPatch = z
  .string()
  .trim()
  .min(8)
  .max(2000)
  .optional()
  .refine((s) => s === undefined || isSafeGoogleMapsUrl(s), { message: mapsUrlMessage });

export const trialZoneCreateSchema = z.object({
  trialPlace: z.string().trim().min(1).max(160),
  zone: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(800),
  navigationUrl: navigationUrl,
  contactDetails: z.string().trim().min(1).max(600),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional().default(true),
});

export const trialZonePatchSchema = z.object({
  trialPlace: z.string().trim().min(1).max(160).optional(),
  zone: z.string().trim().min(1).max(120).optional(),
  address: z.string().trim().min(1).max(800).optional(),
  navigationUrl: navigationUrlOptionalPatch,
  contactDetails: z.string().trim().min(1).max(600).optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});
