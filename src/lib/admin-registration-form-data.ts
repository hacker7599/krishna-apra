import type { NextRequest } from "next/server";
import { registrationAdminCreateSchema, registrationAdminPatchSchema } from "@/lib/admin-entity-schemas";
import type { z } from "zod";
import { saveRegistrationUploads } from "@/lib/parse-registration-form-data";

export type AdminRegistrationCreateParsed = z.infer<typeof registrationAdminCreateSchema>;

export type AdminRegistrationPatchParsed = z.infer<typeof registrationAdminPatchSchema>;

export type AdminRegistrationUploadPaths = {
  playerPhotoPath: string | null;
  idProofPath: string | null;
};

async function readPayloadJson(form: FormData): Promise<unknown> {
  const raw = form.get("payload");
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("MISSING_PAYLOAD");
  }
  return JSON.parse(raw) as unknown;
}

export async function parseAdminRegistrationCreateMultipart(
  req: NextRequest,
): Promise<
  | { ok: true; data: AdminRegistrationCreateParsed; paths: AdminRegistrationUploadPaths }
  | { ok: false; error: string; status: number }
> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return { ok: false, error: "Invalid form data.", status: 400 };
  }

  let payload: unknown;
  try {
    payload = await readPayloadJson(form);
  } catch {
    return { ok: false, error: "Registration details are missing. Please try again.", status: 400 };
  }

  const parsed = registrationAdminCreateSchema.safeParse(payload);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const fieldFlat = Object.values(flat.fieldErrors).flat().filter(Boolean) as string[];
    return {
      ok: false,
      error: fieldFlat[0] ?? "Invalid registration data. Check all required fields.",
      status: 400,
    };
  }

  const uploads = await saveRegistrationUploads(form, {
    requirePlayerPhoto: true,
    requireIdProof: false,
    allowPaymentProof: false,
  });
  if (!uploads.ok) {
    return { ok: false, error: uploads.error, status: 400 };
  }

  return {
    ok: true,
    data: parsed.data,
    paths: {
      playerPhotoPath: uploads.paths.playerPhotoPath,
      idProofPath: uploads.paths.idProofPath,
    },
  };
}

export async function parseAdminRegistrationPatchMultipart(
  req: NextRequest,
  options: { requirePlayerPhotoUnlessExisting: boolean },
): Promise<
  | { ok: true; data: AdminRegistrationPatchParsed; paths: AdminRegistrationUploadPaths }
  | { ok: false; error: string; status: number }
> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return { ok: false, error: "Invalid form data.", status: 400 };
  }

  let payload: unknown;
  try {
    payload = await readPayloadJson(form);
  } catch {
    return { ok: false, error: "Registration details are missing. Please try again.", status: 400 };
  }

  const parsed = registrationAdminPatchSchema.safeParse(payload);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const fieldFlat = Object.values(flat.fieldErrors).flat().filter(Boolean) as string[];
    return {
      ok: false,
      error: fieldFlat[0] ?? "Invalid registration data.",
      status: 400,
    };
  }

  const photoFile = form.get("playerPhoto");
  const hasNewPhoto = photoFile && typeof photoFile !== "string" && photoFile.size > 0;

  if (options.requirePlayerPhotoUnlessExisting && !hasNewPhoto) {
    return { ok: false, error: "Player photo is required.", status: 400 };
  }

  const uploads = await saveRegistrationUploads(form, {
    requirePlayerPhoto: false,
    requireIdProof: false,
    allowPaymentProof: false,
  });
  if (!uploads.ok) {
    return { ok: false, error: uploads.error, status: 400 };
  }

  return {
    ok: true,
    data: parsed.data,
    paths: {
      playerPhotoPath: uploads.paths.playerPhotoPath,
      idProofPath: uploads.paths.idProofPath,
    },
  };
}
