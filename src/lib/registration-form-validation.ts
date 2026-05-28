import { PLAYER_AGE_CUTOFF_DATE, PLAYER_AGE_MIN_BIRTH_DATE } from "@/lib/league";
import type { RoleId } from "@/lib/league";
import { ID_DOCUMENT_TYPES, JERSEY_SIZES } from "@/lib/registration-schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{10}$/;
const MAX_ID_BYTES = 4 * 1024 * 1024;
const ID_ACCEPT = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const PAYMENT_PROOF_ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const PLAYER_PHOTO_ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export type RegistrationFormValues = {
  academyName: string;
  playerName: string;
  fatherName: string;
  address: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  jerseySize: string;
  shoeSize: string;
  idDocumentType: string;
  playerPhoto: File | null;
  idProof: File | null;
  paymentProof: File | null;
  transactionRef: string;
  achievementsAndAwards: string;
  trialZoneId: string;
  roles: Set<RoleId>;
};

function cutoffLabel() {
  const [y, m, d] = PLAYER_AGE_CUTOFF_DATE.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function validateFile(file: File | null, required: boolean, label: string, accept: string[]): string | null {
  if (!file || file.size === 0) {
    return required ? `${label} is required.` : null;
  }
  if (file.size > MAX_ID_BYTES) {
    return `${label} must be under 4 MB.`;
  }
  if (!accept.includes(file.type)) {
    return `${label} must be JPG, PNG, WebP${accept.includes("application/pdf") ? ", or PDF" : ""}.`;
  }
  return null;
}

export function digitsOnlyPhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export type ValidateRegistrationOptions = {
  requirePlayerPhoto?: boolean;
  requireIdProof?: boolean;
  requirePaymentProof?: boolean;
};

export function validateRegistrationForm(
  values: RegistrationFormValues,
  options?: ValidateRegistrationOptions,
): Record<string, string> {
  const requirePlayerPhoto = options?.requirePlayerPhoto ?? true;
  const requireIdProof = options?.requireIdProof ?? true;
  const requirePaymentProof = options?.requirePaymentProof ?? true;
  const errors: Record<string, string> = {};

  const academy = values.academyName.trim();
  if (academy.length < 2) errors.academyName = "Enter academy or club name (at least 2 characters).";
  else if (academy.length > 200) errors.academyName = "Academy name is too long.";

  const player = values.playerName.trim();
  if (player.length < 2) errors.playerName = "Enter player name (at least 2 characters).";
  else if (player.length > 120) errors.playerName = "Player name is too long.";

  const father = values.fatherName.trim();
  if (father.length < 2) errors.fatherName = "Enter father or guardian name (at least 2 characters).";
  else if (father.length > 120) errors.fatherName = "Name is too long.";

  const address = values.address.trim();
  if (address.length < 10) errors.address = "Enter full address (at least 10 characters).";
  else if (address.length > 600) errors.address = "Address is too long.";

  const dob = values.dateOfBirth.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    errors.dateOfBirth = "Select a valid date of birth.";
  } else if (dob <= PLAYER_AGE_CUTOFF_DATE) {
    errors.dateOfBirth = `Player must be born after ${cutoffLabel()} (trial form age cut-off).`;
  } else if (dob < PLAYER_AGE_MIN_BIRTH_DATE) {
    errors.dateOfBirth = `Date of birth must be after ${cutoffLabel()}.`;
  }

  const phone = digitsOnlyPhoneInput(values.phone);
  if (!PHONE_RE.test(phone)) {
    errors.phone = "Enter a valid 10-digit mobile number (digits only).";
  }

  const email = values.email.trim().toLowerCase();
  if (!email) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(email) || email.length > 200) errors.email = "Enter a valid email address.";

  if (!JERSEY_SIZES.includes(values.jerseySize as (typeof JERSEY_SIZES)[number])) {
    errors.jerseySize = "Select a jersey size.";
  }

  const shoe = values.shoeSize.trim();
  if (!shoe) errors.shoeSize = "Enter shoe size.";
  else if (shoe.length > 24) errors.shoeSize = "Shoe size is too long.";

  if (values.roles.size === 0) {
    errors.roles = "Select at least one player role.";
  } else if (values.roles.size > 5) {
    errors.roles = "Select at most five roles.";
  }

  if (!values.trialZoneId.trim()) {
    errors.trialZoneId = "Select your preferred trial zone.";
  }

  if (!ID_DOCUMENT_TYPES.includes(values.idDocumentType as (typeof ID_DOCUMENT_TYPES)[number])) {
    errors.idDocumentType = "Select ID document type.";
  }

  const photoErr = validateFile(values.playerPhoto, requirePlayerPhoto, "Player photo", PLAYER_PHOTO_ACCEPT);
  if (photoErr) errors.playerPhoto = photoErr;

  const idErr = validateFile(values.idProof, requireIdProof, "ID proof", ID_ACCEPT);
  if (idErr) errors.idProof = idErr;

  const payErr = validateFile(values.paymentProof, requirePaymentProof, "Payment screenshot", PAYMENT_PROOF_ACCEPT);
  if (payErr) errors.paymentProof = payErr;

  const ref = values.transactionRef.trim();
  if (ref.length > 120) errors.transactionRef = "Transaction reference is too long.";

  if (values.achievementsAndAwards.trim().length > 2000) {
    errors.achievementsAndAwards = "Achievements text is too long (max 2000 characters).";
  }

  return errors;
}

export function readRegistrationFormValues(form: HTMLFormElement, roles: Set<RoleId>): RegistrationFormValues {
  const fd = new FormData(form);
  const photoFile = fd.get("playerPhoto");
  const idFile = fd.get("idProof");
  const payFile = fd.get("paymentProof");

  return {
    academyName: String(fd.get("academyName") ?? ""),
    playerName: String(fd.get("playerName") ?? ""),
    fatherName: String(fd.get("fatherName") ?? ""),
    address: String(fd.get("address") ?? ""),
    dateOfBirth: String(fd.get("dateOfBirth") ?? ""),
    phone: String(fd.get("phone") ?? ""),
    email: String(fd.get("email") ?? ""),
    jerseySize: String(fd.get("jerseySize") ?? ""),
    shoeSize: String(fd.get("shoeSize") ?? ""),
    idDocumentType: String(fd.get("idDocumentType") ?? ""),
    playerPhoto: photoFile instanceof File && photoFile.size > 0 ? photoFile : null,
    idProof: idFile instanceof File && idFile.size > 0 ? idFile : null,
    paymentProof: payFile instanceof File && payFile.size > 0 ? payFile : null,
    transactionRef: String(fd.get("transactionRef") ?? ""),
    achievementsAndAwards: String(fd.get("achievementsAndAwards") ?? ""),
    trialZoneId: String(fd.get("trialZoneId") ?? ""),
    roles,
  };
}

export function firstRegistrationFormError(errors: Record<string, string>): string | null {
  const order = [
    "academyName",
    "playerName",
    "playerPhoto",
    "fatherName",
    "address",
    "dateOfBirth",
    "phone",
    "email",
    "jerseySize",
    "shoeSize",
    "trialZoneId",
    "roles",
    "idDocumentType",
    "idProof",
    "paymentProof",
    "transactionRef",
    "achievementsAndAwards",
  ];
  for (const key of order) {
    if (errors[key]) return errors[key];
  }
  return null;
}
