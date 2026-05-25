import type { Registration, TrialZone } from "@prisma/client";
import { formatRoleLabels } from "@/lib/registration-roles";
import { trialVenueDisplayLabel } from "@/lib/trial-zone-catalog";
import { ID_DOCUMENT_LABELS, type IdDocumentType } from "@/lib/registration-schema";

export type AdminRegistrationDetail = {
  id: string;
  createdAt: string;
  academyName: string;
  playerName: string;
  dateOfBirth: string;
  roles: string[];
  rolesDisplay: string;
  email: string;
  phone: string;
  fatherName: string | null;
  address: string | null;
  jerseySize: string | null;
  shoeSize: string | null;
  idDocumentType: string | null;
  idDocumentLabel: string | null;
  achievementsAndAwards: string | null;
  trialZone: string | null;
  paymentStatus: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  transactionRef: string | null;
  feeReceivedDate: string | null;
  coachName: string | null;
  proofs: {
    photo: string | null;
    id: string | null;
    payment: string | null;
  };
  proofMeta: {
    hasPhoto: boolean;
    hasId: boolean;
    hasPayment: boolean;
    idIsPdf: boolean;
  };
};

type Row = Registration & {
  trialZone?: Pick<TrialZone, "trialPlace" | "zone"> | null;
};

function proofUrl(registrationId: string, kind: "photo" | "id" | "payment"): string {
  return `/api/admin/proof?id=${encodeURIComponent(registrationId)}&kind=${kind}`;
}

export function toAdminRegistrationDetail(row: Row): AdminRegistrationDetail {
  let roles: string[] = [];
  try {
    roles = JSON.parse(row.roles) as string[];
  } catch {
    roles = [row.roles];
  }

  const idDocumentLabel =
    row.idDocumentType && row.idDocumentType in ID_DOCUMENT_LABELS
      ? ID_DOCUMENT_LABELS[row.idDocumentType as IdDocumentType]
      : row.idDocumentType;

  const idPath = row.idProofPath?.replace(/\\/g, "/") ?? null;

  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    academyName: row.academyName,
    playerName: row.playerName,
    dateOfBirth: row.dateOfBirth.toISOString().slice(0, 10),
    roles,
    rolesDisplay: formatRoleLabels(roles).join(" · "),
    email: row.email,
    phone: row.phone,
    fatherName: row.fatherName,
    address: row.address,
    jerseySize: row.jerseySize,
    shoeSize: row.shoeSize,
    idDocumentType: row.idDocumentType,
    idDocumentLabel,
    achievementsAndAwards: row.achievementsAndAwards,
    trialZone: row.trialZone ? trialVenueDisplayLabel(row.trialZone) : null,
    paymentStatus: row.paymentStatus,
    razorpayOrderId: row.razorpayOrderId,
    razorpayPaymentId: row.razorpayPaymentId,
    transactionRef: row.transactionRef,
    feeReceivedDate: row.feeReceivedDate,
    coachName: row.coachName,
    proofs: {
      photo: row.playerPhotoPath ? proofUrl(row.id, "photo") : null,
      id: row.idProofPath ? proofUrl(row.id, "id") : null,
      payment: row.paymentProofPath ? proofUrl(row.id, "payment") : null,
    },
    proofMeta: {
      hasPhoto: Boolean(row.playerPhotoPath),
      hasId: Boolean(row.idProofPath),
      hasPayment: Boolean(row.paymentProofPath),
      idIsPdf: idPath?.toLowerCase().endsWith(".pdf") ?? false,
    },
  };
}
