import type { Registration, TrialZone } from "@prisma/client";
import { tryEnsureRegistrationCodes } from "@/lib/registration-codes";
import { adminRegistrationProofUrl } from "@/lib/admin-registration-proof-url";
import { isRazorpayAbandonedRegistration, razorpayAbandonedLabel } from "@/lib/razorpay-checkout-admin";
import { isEnrolledPaymentStatus } from "@/lib/registration-payment-status";
import { formatRoleLabels } from "@/lib/registration-roles";
import { trialVenueDisplayLabel } from "@/lib/trial-zone-catalog";
import { ID_DOCUMENT_LABELS, type IdDocumentType } from "@/lib/registration-schema";
import { prisma } from "@/lib/prisma";

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
  registrationCode: string | null;
  paymentCode: string | null;
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
  paymentOrderStatus: string | null;
  razorpayCheckoutNote: string | null;
};

type Row = Registration & {
  trialZone?: Pick<TrialZone, "trialPlace" | "zone"> | null;
};

export { adminRegistrationProofUrl } from "@/lib/admin-registration-proof-url";

export async function loadAdminRegistrationDetail(row: Row): Promise<AdminRegistrationDetail> {
  const codes = await tryEnsureRegistrationCodes(row.id, {
    assignPaymentIfPaid: isEnrolledPaymentStatus(row.paymentStatus),
    paymentStatus: row.paymentStatus,
  });

  const current = await prisma.registration.findUnique({
    where: { id: row.id },
    include: { trialZone: { select: { trialPlace: true, zone: true } } },
  });
  if (!current) {
    throw new Error("Registration not found");
  }

  let paymentOrderStatus: string | null = null;
  let lastCheckoutMessage: string | null = null;

  if (current.razorpayOrderId) {
    const order = await prisma.paymentOrder.findUnique({
      where: { razorpayOrderId: current.razorpayOrderId },
      select: { status: true },
    });
    paymentOrderStatus = order?.status ?? null;

    const lastCheckoutLog = await prisma.paymentLog.findFirst({
      where: {
        registrationId: current.id,
        eventType: { in: ["checkout.dismissed", "checkout.payment_failed"] },
      },
      orderBy: { createdAt: "desc" },
      select: { message: true },
    });
    lastCheckoutMessage = lastCheckoutLog?.message ?? null;
  }

  const base = toAdminRegistrationDetail(current, paymentOrderStatus, codes);
  const razorpayCheckoutNote = isRazorpayAbandonedRegistration({
    paymentStatus: current.paymentStatus,
    paymentProofPath: current.paymentProofPath,
    razorpayOrderId: current.razorpayOrderId,
    razorpayPaymentId: current.razorpayPaymentId,
    paymentOrderStatus,
  })
    ? lastCheckoutMessage ?? razorpayAbandonedLabel({ paymentOrderStatus })
    : null;

  return { ...base, paymentOrderStatus, razorpayCheckoutNote };
}

export function toAdminRegistrationDetail(
  row: Row,
  paymentOrderStatus: string | null = null,
  codes?: { registrationCode: string | null; paymentCode: string | null },
): AdminRegistrationDetail {
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
    registrationCode: codes?.registrationCode ?? row.registrationCode ?? null,
    paymentCode: codes?.paymentCode ?? row.paymentCode ?? null,
    razorpayOrderId: row.razorpayOrderId,
    razorpayPaymentId: row.razorpayPaymentId,
    transactionRef: row.transactionRef,
    feeReceivedDate: row.feeReceivedDate,
    coachName: row.coachName,
    proofs: {
      photo: row.playerPhotoPath ? adminRegistrationProofUrl(row.id, "photo") : null,
      id: row.idProofPath ? adminRegistrationProofUrl(row.id, "id") : null,
      payment: row.paymentProofPath ? adminRegistrationProofUrl(row.id, "payment") : null,
    },
    proofMeta: {
      hasPhoto: Boolean(row.playerPhotoPath),
      hasId: Boolean(row.idProofPath),
      hasPayment: Boolean(row.paymentProofPath),
      idIsPdf: idPath?.toLowerCase().endsWith(".pdf") ?? false,
    },
    paymentOrderStatus,
    razorpayCheckoutNote: null,
  };
}
