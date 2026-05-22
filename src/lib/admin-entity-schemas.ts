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

const roleEnum = z.enum(["BATSMAN", "ALL_ROUNDER", "WICKET_KEEPER", "BOWLER", "SPINNER"]);
const idDocumentTypeEnum = z.enum(["AADHAAR", "PASSPORT", "BIRTH_CERTIFICATE"]);
const jerseySizeEnum = z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]);
const paymentStatusEnum = z.enum(["paid", "manual", "pending", "refunded"]);

const registrationCore = {
  academyName: z.string().trim().min(2).max(200),
  playerName: z.string().trim().min(2).max(120),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  roles: z.array(roleEnum).min(1).max(5),
  email: z.string().trim().email().max(200),
  phone: z
    .string()
    .trim()
    .min(10)
    .max(18)
    .regex(/^\+?[0-9\s-]{10,18}$/),
  fatherName: z.string().trim().min(2).max(120),
  address: z.string().trim().min(10).max(600),
  jerseySize: jerseySizeEnum,
  shoeSize: z.string().trim().min(1).max(24),
  idDocumentType: idDocumentTypeEnum,
  achievementsAndAwards: z.string().trim().max(2000).optional().nullable(),
  transactionRef: z.string().trim().max(120).optional().nullable(),
  feeReceivedDate: z.string().trim().max(40).optional().nullable(),
  coachName: z.string().trim().max(120).optional().nullable(),
  paymentStatus: paymentStatusEnum.optional(),
};

export const registrationAdminCreateSchema = z.object({
  ...registrationCore,
  paymentStatus: paymentStatusEnum.optional().default("manual"),
});

export const registrationAdminPatchSchema = z
  .object({
    academyName: registrationCore.academyName.optional(),
    playerName: registrationCore.playerName.optional(),
    dateOfBirth: registrationCore.dateOfBirth.optional(),
    roles: registrationCore.roles.optional(),
    email: registrationCore.email.optional(),
    phone: registrationCore.phone.optional(),
    fatherName: registrationCore.fatherName.optional(),
    address: registrationCore.address.optional(),
    jerseySize: registrationCore.jerseySize.optional(),
    shoeSize: registrationCore.shoeSize.optional(),
    idDocumentType: registrationCore.idDocumentType.optional(),
    achievementsAndAwards: registrationCore.achievementsAndAwards,
    transactionRef: registrationCore.transactionRef,
    feeReceivedDate: registrationCore.feeReceivedDate,
    coachName: registrationCore.coachName,
    paymentStatus: paymentStatusEnum.optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), { message: "No fields to update" });
