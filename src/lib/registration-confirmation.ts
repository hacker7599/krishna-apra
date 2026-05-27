import type { Registration } from "@prisma/client";
import { TRIAL_FEE_INR } from "@/lib/league";
import { formatRoleLabels } from "@/lib/registration-roles";
import { trialVenueDisplayLabel } from "@/lib/trial-zone-catalog";
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
  trialZone: string | null;
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

type RegistrationWithZone = Registration & {
  trialZone?: { trialPlace: string; zone: string } | null;
};

export function toRegistrationConfirmation(row: RegistrationWithZone): RegistrationConfirmation {
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
    roles: (() => {
      try {
        return formatRoleLabels(JSON.parse(row.roles) as string[]);
      } catch {
        return [row.roles];
      }
    })(),
    email: row.email,
    phone: row.phone,
    fatherName: row.fatherName,
    address: row.address,
    jerseySize: row.jerseySize,
    shoeSize: row.shoeSize,
    idDocumentType: idLabel,
    achievementsAndAwards: row.achievementsAndAwards,
    trialZone: row.trialZone ? trialVenueDisplayLabel(row.trialZone) : null,
    payment: {
      status: row.paymentStatus ?? "manual",
      method: paidOnline ? "Approved by admin" : "Pending manual verification",
      amountInr: TRIAL_FEE_INR,
      currency: "INR",
      razorpayOrderId: row.razorpayOrderId,
      razorpayPaymentId: row.razorpayPaymentId,
      transactionRef: row.transactionRef,
    },
  };
}
