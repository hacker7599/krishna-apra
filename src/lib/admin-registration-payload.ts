import type { AdminRegistrationFormState } from "@/components/admin/admin-registration-form-fields";

export function adminRegistrationFormToPayload(form: AdminRegistrationFormState) {
  return {
    academyName: form.academyName,
    playerName: form.playerName,
    dateOfBirth: form.dateOfBirth,
    roles: form.roles,
    email: form.email,
    phone: form.phone,
    fatherName: form.fatherName,
    address: form.address,
    jerseySize: form.jerseySize,
    shoeSize: form.shoeSize,
    idDocumentType: form.idDocumentType,
    achievementsAndAwards: form.achievementsAndAwards || null,
    trialZoneId: form.trialZoneId || null,
    transactionRef: form.transactionRef || null,
    feeReceivedDate: form.feeReceivedDate || null,
    coachName: form.coachName || null,
    paymentStatus: form.paymentStatus,
  };
}

export function adminRegistrationFormToFormData(
  payload: Record<string, unknown>,
  files: { playerPhoto?: File | null; idProof?: File | null },
): FormData {
  const fd = new FormData();
  fd.append("payload", JSON.stringify(payload));
  if (files.playerPhoto && files.playerPhoto.size > 0) {
    fd.append("playerPhoto", files.playerPhoto);
  }
  if (files.idProof && files.idProof.size > 0) {
    fd.append("idProof", files.idProof);
  }
  return fd;
}

export function paymentOrderToAdminFormPrefill(order: {
  playerName: string | null;
  email: string | null;
  phone: string | null;
  razorpayPaymentId: string | null;
  paidAt: Date | null;
}): Partial<AdminRegistrationFormState> {
  return {
    playerName: order.playerName ?? "",
    email: order.email ?? "",
    phone: order.phone ?? "",
    paymentStatus: "paid",
    transactionRef: order.razorpayPaymentId ?? "",
    feeReceivedDate: order.paidAt
      ? order.paidAt.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  };
}
