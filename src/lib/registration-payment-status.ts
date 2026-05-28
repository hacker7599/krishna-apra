/** Registrations with these statuses count as enrolled players in admin. */
export const REGISTRATION_PAYMENT_PAID = "paid" as const;
export const REGISTRATION_PAYMENT_MANUAL = "manual" as const;
export const REGISTRATION_PAYMENT_PENDING = "pending_payment" as const;

/** Legacy value written before pending_payment was standardized. */
export const REGISTRATION_PAYMENT_PENDING_LEGACY = "pending" as const;

export const ENROLLED_PAYMENT_STATUSES = [REGISTRATION_PAYMENT_PAID, REGISTRATION_PAYMENT_MANUAL] as const;

export const AWAITING_VERIFICATION_PAYMENT_STATUSES = [
  REGISTRATION_PAYMENT_PENDING,
  REGISTRATION_PAYMENT_PENDING_LEGACY,
] as const;

export function isEnrolledPaymentStatus(status: string | null | undefined): boolean {
  return status === REGISTRATION_PAYMENT_PAID || status === REGISTRATION_PAYMENT_MANUAL;
}

export function isPendingPaymentStatus(status: string | null | undefined): boolean {
  return (
    status === REGISTRATION_PAYMENT_PENDING || status === REGISTRATION_PAYMENT_PENDING_LEGACY
  );
}

/** Normalize admin/UI values to the value stored in the database. */
export function normalizeRegistrationPaymentStatus(status: string): string {
  if (status === REGISTRATION_PAYMENT_PENDING_LEGACY || status === "pending") {
    return REGISTRATION_PAYMENT_PENDING;
  }
  return status;
}
