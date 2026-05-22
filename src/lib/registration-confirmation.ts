import type { Registration } from "@prisma/client";
import { ROLE_OPTIONS, TRIAL_FEE_INR } from "@/lib/league";
import { ID_DOCUMENT_LABELS, type IdDocumentType } from "@/lib/registration-schema";

export type RegistrationConfirmation = {
  registrationId: string;
  submittedAt: string;
  academyName: string;
  playerName: string;
  dateOfBirth: string;
  roles: string[];
  email: string;
  phone: string;
  fatherName: string | null;
  address: string | null;
  jerseySize: string | null;
  shoeSize: string | null;
  idDocumentType: string | null;
  achievementsAndAwards: string | null;
  payment: {
    status: string;
    method: string;
    amountInr: number;
    currency: string;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    transactionRef: string | null;
  };
};

function formatRoles(json: string): string[] {
  try {
    const arr = JSON.parse(json) as string[];
    const map = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.id, r.label]));
    return arr.map((id) => map[id] ?? id);
  } catch {
    return [json];
  }
}

export function toRegistrationConfirmation(row: Registration): RegistrationConfirmation {
  const idLabel =
    row.idDocumentType && row.idDocumentType in ID_DOCUMENT_LABELS
      ? ID_DOCUMENT_LABELS[row.idDocumentType as IdDocumentType]
      : row.idDocumentType;

  const paidOnline = row.paymentStatus === "paid";

  return {
    registrationId: row.id,
    submittedAt: row.createdAt.toISOString(),
    academyName: row.academyName,
    playerName: row.playerName,
    dateOfBirth: row.dateOfBirth.toISOString().slice(0, 10),
    roles: formatRoles(row.roles),
    email: row.email,
    phone: row.phone,
    fatherName: row.fatherName,
    address: row.address,
    jerseySize: row.jerseySize,
    shoeSize: row.shoeSize,
    idDocumentType: idLabel,
    achievementsAndAwards: row.achievementsAndAwards,
    payment: {
      status: row.paymentStatus ?? "manual",
      method: paidOnline ? "Razorpay (online)" : "Manual / offline verification",
      amountInr: TRIAL_FEE_INR,
      currency: "INR",
      razorpayOrderId: row.razorpayOrderId,
      razorpayPaymentId: row.razorpayPaymentId,
      transactionRef: row.transactionRef,
    },
  };
}
