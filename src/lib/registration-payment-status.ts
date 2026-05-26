/** Registrations with these statuses count as enrolled players in admin. */
export const REGISTRATION_PAYMENT_PAID = "paid" as const;
export const REGISTRATION_PAYMENT_MANUAL = "manual" as const;
export const REGISTRATION_PAYMENT_PENDING = "pending_payment" as const;

export const ENROLLED_PAYMENT_STATUSES = [REGISTRATION_PAYMENT_PAID, REGISTRATION_PAYMENT_MANUAL] as const;

export function isEnrolledPaymentStatus(status: string | null | undefined): boolean {
  return status === REGISTRATION_PAYMENT_PAID || status === REGISTRATION_PAYMENT_MANUAL;
}
