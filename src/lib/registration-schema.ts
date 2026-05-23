import { z } from "zod";
import { PLAYER_AGE_CUTOFF_DATE } from "@/lib/league";
import { normalizePhone } from "@/lib/normalize-phone";
import { ROLE_IDS } from "@/lib/registration-roles";

const roleEnum = z.enum(ROLE_IDS);

export const ID_DOCUMENT_TYPES = ["AADHAAR", "PASSPORT", "BIRTH_CERTIFICATE"] as const;
export type IdDocumentType = (typeof ID_DOCUMENT_TYPES)[number];

export const ID_DOCUMENT_LABELS: Record<IdDocumentType, string> = {
  AADHAAR: "Aadhaar card",
  PASSPORT: "Passport (minimum 3-year validity)",
  BIRTH_CERTIFICATE: "Birth certificate",
};

export const JERSEY_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

const idDocumentTypeEnum = z.enum(ID_DOCUMENT_TYPES);
const jerseySizeEnum = z.enum(JERSEY_SIZES);

export const registrationSchema = z
  .object({
    academyName: z.string().trim().min(2).max(200),
    playerName: z.string().trim().min(2).max(120),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    roles: z.array(roleEnum).min(1).max(5),
    trialZoneId: z.string().trim().min(1, "Select a trial zone."),
    email: z.string().trim().email().max(200),
    phone: z
      .string()
      .trim()
      .transform((s) => normalizePhone(s))
      .refine((s) => /^[0-9]{10}$/.test(s), {
        message: "Enter a valid 10-digit mobile number (digits only).",
      }),
    fatherName: z.string().trim().min(2).max(120),
    address: z.string().trim().min(10).max(600),
    jerseySize: jerseySizeEnum,
    shoeSize: z.string().trim().min(1).max(24),
    idDocumentType: idDocumentTypeEnum,
    transactionRef: z.string().trim().max(120).optional(),
    achievementsAndAwards: z.string().trim().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.dateOfBirth <= PLAYER_AGE_CUTOFF_DATE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Players must be born after ${formatCutoffDisplay(PLAYER_AGE_CUTOFF_DATE)} (trial form age cut-off).`,
        path: ["dateOfBirth"],
      });
    }
  });

function formatCutoffDisplay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export type RegistrationInput = z.infer<typeof registrationSchema>;
