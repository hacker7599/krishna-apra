import type { PaymentOrder, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { REGISTRATION_PAYMENT_PENDING } from "@/lib/registration-payment-status";

/** OR clause for paid orders not fully enrolled — no Prisma relation required. */
export async function paidOrphanPaymentOrderFilter(): Promise<Prisma.PaymentOrderWhereInput> {
  const pending = await prisma.registration.findMany({
    where: { paymentStatus: REGISTRATION_PAYMENT_PENDING },
    select: { id: true },
  });
  const pendingIds = pending.map((r) => r.id);
  return {
    status: "paid",
    OR: [
      { registrationId: null },
      ...(pendingIds.length > 0 ? [{ registrationId: { in: pendingIds } }] : []),
    ],
  };
}

export type PaymentOrderWithRegStatus = PaymentOrder & {
  registrationPaymentStatus: string | null;
};

export async function attachRegistrationPaymentStatus<T extends PaymentOrder>(
  orders: T[],
): Promise<(T & { registrationPaymentStatus: string | null })[]> {
  const regIds = [...new Set(orders.map((o) => o.registrationId).filter((id): id is string => Boolean(id)))];
  if (regIds.length === 0) {
    return orders.map((o) => ({ ...o, registrationPaymentStatus: null }));
  }

  const registrations = await prisma.registration.findMany({
    where: { id: { in: regIds } },
    select: { id: true, paymentStatus: true },
  });
  const statusById = new Map(registrations.map((r) => [r.id, r.paymentStatus]));

  return orders.map((o) => ({
    ...o,
    registrationPaymentStatus: o.registrationId ? (statusById.get(o.registrationId) ?? null) : null,
  }));
}

export async function loadRegistrationForPaymentOrder(registrationId: string | null) {
  if (!registrationId) return null;
  return prisma.registration.findUnique({
    where: { id: registrationId },
    select: { id: true, playerName: true, paymentStatus: true, email: true, phone: true },
  });
}
