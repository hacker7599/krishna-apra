import { registrationSchema } from "@/lib/registration-schema";
import { normalizePhone } from "@/lib/normalize-phone";
import { saveIdProof, savePaymentProof, savePlayerPhoto } from "@/lib/save-upload";

export type ParsedRegistrationForm = {
  data: ReturnType<typeof registrationSchema.parse>;
  emailNorm: string;
  phoneNorm: string;
  rolesJson: string;
};

export function parseRegistrationFormFields(form: FormData):
  | { ok: true; parsed: ParsedRegistrationForm }
  | { ok: false; error: string; details?: unknown } {
  let roles: unknown;
  try {
    roles = JSON.parse(String(form.get("roles") ?? "null"));
  } catch {
    return { ok: false, error: "Invalid roles payload." };
  }

  const payload = {
    academyName: String(form.get("academyName") ?? ""),
    playerName: String(form.get("playerName") ?? ""),
    dateOfBirth: String(form.get("dateOfBirth") ?? ""),
    roles,
    email: String(form.get("email") ?? ""),
    phone: String(form.get("phone") ?? ""),
    fatherName: String(form.get("fatherName") ?? ""),
    address: String(form.get("address") ?? ""),
    jerseySize: String(form.get("jerseySize") ?? ""),
    shoeSize: String(form.get("shoeSize") ?? ""),
    idDocumentType: String(form.get("idDocumentType") ?? ""),
    transactionRef: form.get("transactionRef") ? String(form.get("transactionRef")) : undefined,
    achievementsAndAwards: form.get("achievementsAndAwards") ? String(form.get("achievementsAndAwards")) : undefined,
    trialZoneId: String(form.get("trialZoneId") ?? ""),
  };

  const parsed = registrationSchema.safeParse(payload);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const fieldFlat = Object.values(flat.fieldErrors).flat().filter(Boolean) as string[];
    const msg = flat.fieldErrors.dateOfBirth?.[0] ?? fieldFlat[0] ?? "Invalid form data. Please check all required fields.";
    return { ok: false, error: msg, details: flat };
  }

  const emailNorm = parsed.data.email.toLowerCase();
  const phoneNorm = normalizePhone(parsed.data.phone);

  return {
    ok: true,
    parsed: {
      data: parsed.data,
      emailNorm,
      phoneNorm,
      rolesJson: JSON.stringify(parsed.data.roles),
    },
  };
}

export type SavedUploadPaths = {
  playerPhotoPath: string;
  idProofPath: string;
  paymentProofPath: string | null;
};

function uploadErrorMessage(e: unknown, label: string): string {
  const code = e instanceof Error ? e.message : "";
  if (code === "FILE_TOO_LARGE") return `${label} must be under 4 MB.`;
  if (code === "FILE_TYPE") {
    if (label.includes("ID")) return `${label} must be JPG, PNG, WebP, or PDF.`;
    return `${label} must be JPG, PNG, or WebP.`;
  }
  return `Could not upload ${label.toLowerCase()}.`;
}

export async function saveRegistrationUploads(
  form: FormData,
  options: { requirePlayerPhoto: boolean; requireIdProof: boolean; allowPaymentProof: boolean },
): Promise<{ ok: true; paths: SavedUploadPaths } | { ok: false; error: string }> {
  const photoFile = form.get("playerPhoto");
  const idFile = form.get("idProof");
  const payFile = form.get("paymentProof");

  if (options.requirePlayerPhoto) {
    if (!photoFile || typeof photoFile === "string" || photoFile.size === 0) {
      return { ok: false, error: "Player photo is required." };
    }
  }

  if (options.requireIdProof) {
    if (!idFile || typeof idFile === "string" || idFile.size === 0) {
      return {
        ok: false,
        error: "Government ID proof upload is required (Aadhaar, passport, or birth certificate).",
      };
    }
  }

  let playerPhotoPath: string | null = null;
  if (photoFile && typeof photoFile !== "string" && photoFile.size > 0) {
    try {
      playerPhotoPath = await savePlayerPhoto(photoFile as File);
    } catch (e) {
      return { ok: false, error: uploadErrorMessage(e, "Player photo") };
    }
  }

  if (options.requirePlayerPhoto && !playerPhotoPath) {
    return { ok: false, error: "Player photo is required." };
  }

  let idProofPath: string | null = null;
  if (idFile && typeof idFile !== "string" && idFile.size > 0) {
    try {
      idProofPath = await saveIdProof(idFile as File);
    } catch (e) {
      return { ok: false, error: uploadErrorMessage(e, "ID proof") };
    }
  }

  if (options.requireIdProof && !idProofPath) {
    return {
      ok: false,
      error: "Government ID proof upload is required (Aadhaar, passport, or birth certificate).",
    };
  }

  let paymentProofPath: string | null = null;
  if (options.allowPaymentProof && payFile && typeof payFile !== "string" && payFile.size > 0) {
    try {
      paymentProofPath = await savePaymentProof(payFile as File);
    } catch (e) {
      return { ok: false, error: uploadErrorMessage(e, "Payment proof") };
    }
  }

  return {
    ok: true,
    paths: {
      playerPhotoPath: playerPhotoPath!,
      idProofPath: idProofPath!,
      paymentProofPath,
    },
  };
}
