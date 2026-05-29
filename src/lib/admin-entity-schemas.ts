import { z } from "zod";
import { isEmptyEditorHtml } from "@/lib/blog-content-utils";
import { normalizeHexColor } from "@/lib/hex-color";
import { normalizeRegistrationPaymentStatus } from "@/lib/registration-payment-status";
import { normalizeRoleIds, ROLE_IDS } from "@/lib/registration-roles";
import { isSafeBannerCtaHref, isSafeGoogleMapsUrl } from "@/lib/safe-public-href";

const blogOgImageUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .nullable()
  .refine(
    (u) =>
      u == null ||
      u === "" ||
      u.startsWith("/api/blog/media/") ||
      u.startsWith("/api/banners/media/") ||
      u.startsWith("/branding/") ||
      (u.startsWith("https://") && u.includes("images.unsplash.com")),
    "OG image must be an uploaded path, /branding/, or Unsplash CDN.",
  );

const hexColor = z
  .string()
  .transform((s) => normalizeHexColor(s))
  .pipe(z.string().regex(/^#[0-9a-f]{6}$/i, "Use #RRGGBB hex colour"));

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

const teamLogoPath = z
  .union([z.string().trim().max(200), z.null()])
  .optional()
  .refine(
    (p) =>
      p === undefined ||
      p === null ||
      p === "" ||
      /^teams\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(p),
    "Logo path must be an uploaded team logo.",
  )
  .transform((p) => (p === "" ? null : p));

export const teamCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  logoPath: teamLogoPath,
  description: z.string().trim().max(500).optional().default(""),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional().default(true),
});

export const teamPatchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  city: z.string().trim().min(2).max(80).optional(),
  logoPath: teamLogoPath,
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

const optionalNavigationUrl = z
  .union([z.string().max(2048), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === undefined) return null;
    const t = v.trim();
    return t === "" ? null : t;
  })
  .refine((s) => s === null || isSafeGoogleMapsUrl(s), { message: mapsUrlMessage });

const optionalContactDetails = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === undefined) return null;
    const t = v.trim();
    return t === "" ? null : t;
  });

export const trialZoneCreateSchema = z.object({
  trialPlace: z.string().trim().min(1).max(160),
  zone: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(800),
  navigationUrl: optionalNavigationUrl,
  contactDetails: optionalContactDetails,
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional().default(true),
});

export const trialZonePatchSchema = z.object({
  trialPlace: z.string().trim().min(1).max(160).optional(),
  zone: z.string().trim().min(1).max(120).optional(),
  address: z.string().trim().min(1).max(800).optional(),
  navigationUrl: optionalNavigationUrl.optional(),
  contactDetails: optionalContactDetails.optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

const optionalTrialZoneId = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === undefined) return null;
    const t = String(v).trim();
    return t === "" ? null : t;
  });

const isoDateTime = z.string().datetime({ offset: true });

export const trialScheduleCreateSchema = z.object({
  title: z.string().trim().min(2).max(160),
  scheduledAt: isoDateTime,
  endAt: isoDateTime.optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  trialZoneId: optionalTrialZoneId,
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional().default(true),
});

export const trialSchedulePatchSchema = z
  .object({
    title: z.string().trim().min(2).max(160).optional(),
    scheduledAt: isoDateTime.optional(),
    endAt: isoDateTime.optional().nullable(),
    notes: z.string().trim().max(2000).optional().nullable(),
    trialZoneId: optionalTrialZoneId.optional(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), { message: "No fields to update" });

const roleEnum = z.enum(ROLE_IDS);
const rolesSchema = z.preprocess((value) => {
  if (!Array.isArray(value)) return value;
  return normalizeRoleIds(value.map((item) => String(item ?? "")));
}, z.array(roleEnum).min(1).max(5));
const idDocumentTypeEnum = z.enum(["AADHAAR", "PASSPORT", "BIRTH_CERTIFICATE"]);
const jerseySizeEnum = z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]);
const paymentStatusEnum = z
  .enum(["paid", "manual", "pending_payment", "pending", "refunded"])
  .transform(normalizeRegistrationPaymentStatus);

const registrationCore = {
  academyName: z.string().trim().min(2).max(200),
  playerName: z.string().trim().min(2).max(120),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  roles: rolesSchema,
  trialZoneId: z.string().trim().min(1).optional().nullable(),
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

const blogImageUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .nullable()
  .refine(
    (u) => u == null || u === "" || u.startsWith("/") || u.startsWith("https://"),
    "Image must be uploaded or use a path starting with / or https://",
  );

const blogCanonicalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .nullable()
  .refine((u) => u == null || u === "" || isSafeBannerCtaHref(u), {
    message: "Canonical URL must be a same-site path (starting with /) or safe https:// link.",
  });

export const blogPostCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().trim().max(500).optional().default(""),
  content: z
    .string()
    .max(100_000)
    .refine((c) => !isEmptyEditorHtml(c), { message: "Article body is required" }),
  coverImageUrl: blogImageUrl,
  authorName: z.string().trim().max(120).optional().default(""),
  published: z.boolean().optional().default(false),
  metaTitle: z.string().trim().max(70).optional().nullable(),
  metaDescription: z.string().trim().max(320).optional().nullable(),
  metaKeywords: z.string().trim().max(500).optional().nullable(),
  ogImageUrl: blogOgImageUrl,
  canonicalUrl: blogCanonicalUrl,
  robotsNoindex: z.boolean().optional().default(false),
});

export const blogPostPatchSchema = z
  .object({
    title: z.string().trim().min(2).max(200).optional(),
    slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/).optional(),
    excerpt: z.string().trim().max(500).optional(),
    content: z
      .string()
      .max(100_000)
      .optional()
      .refine((c) => c === undefined || !isEmptyEditorHtml(c), { message: "Article body cannot be empty" }),
    coverImageUrl: blogImageUrl,
    authorName: z.string().trim().max(120).optional(),
    published: z.boolean().optional(),
    metaTitle: z.string().trim().max(70).optional().nullable(),
    metaDescription: z.string().trim().max(320).optional().nullable(),
    metaKeywords: z.string().trim().max(500).optional().nullable(),
    ogImageUrl: blogOgImageUrl,
    canonicalUrl: blogCanonicalUrl,
    robotsNoindex: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), { message: "No fields to update" });

export const registrationAdminPatchSchema = z
  .object({
    academyName: registrationCore.academyName.optional(),
    playerName: registrationCore.playerName.optional(),
    dateOfBirth: registrationCore.dateOfBirth.optional(),
    roles: registrationCore.roles.optional(),
    trialZoneId: registrationCore.trialZoneId,
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
