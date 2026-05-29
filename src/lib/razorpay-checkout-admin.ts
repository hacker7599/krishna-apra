import { REGISTRATION_PAYMENT_PENDING } from "@/lib/registration-payment-status";

/** Admin UI: Razorpay started but not completed (desk can follow up). */
export function isRazorpayAbandonedRegistration(row: {
  paymentStatus: string | null;
  paymentProofPath: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paymentOrderStatus?: string | null;
}): boolean {
  if (row.paymentStatus !== REGISTRATION_PAYMENT_PENDING) return false;
  if (row.paymentProofPath?.trim()) return false;
  if (!row.razorpayOrderId?.trim()) return false;
  if (row.razorpayPaymentId?.trim()) return false;
  const orderStatus = row.paymentOrderStatus ?? "created";
  return orderStatus === "failed" || orderStatus === "created";
}

export function razorpayAbandonedLabel(row: { paymentOrderStatus?: string | null }): string {
  if (row.paymentOrderStatus === "failed") return "Razorpay cancelled / failed";
  return "Razorpay incomplete";
}
