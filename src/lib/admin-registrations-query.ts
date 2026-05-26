import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ENROLLED_PAYMENT_STATUSES, REGISTRATION_PAYMENT_PENDING } from "@/lib/registration-payment-status";

export type RegistrationListRow = Awaited<ReturnType<typeof prisma.registration.findMany>>[number];

export function registrationMatchesQuery(row: RegistrationListRow, q: string): boolean {
  const n = q.toLowerCase();
  const ext = row as RegistrationListRow & {
    achievementsAndAwards?: string | null;
    razorpayPaymentId?: string | null;
    razorpayOrderId?: string | null;
  };
  return (
    row.playerName.toLowerCase().includes(n) ||
    row.academyName.toLowerCase().includes(n) ||
    row.email.toLowerCase().includes(n) ||
    row.phone.includes(q) ||
    (row.transactionRef?.toLowerCase().includes(n) ?? false) ||
    (row.fatherName?.toLowerCase().includes(n) ?? false) ||
    (row.address?.toLowerCase().includes(n) ?? false) ||
    (row.coachName?.toLowerCase().includes(n) ?? false) ||
    (ext.achievementsAndAwards?.toLowerCase().includes(n) ?? false) ||
    (ext.razorpayPaymentId?.includes(q) ?? false) ||
    (ext.razorpayOrderId?.includes(q) ?? false)
  );
}

export function buildDateFilter(from?: string, to?: string) {
  const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (from) {
    const d = new Date(from + "T00:00:00.000Z");
    if (!Number.isNaN(d.getTime())) where.createdAt = { ...where.createdAt, gte: d };
  }
  if (to) {
    const d = new Date(to + "T23:59:59.999Z");
    if (!Number.isNaN(d.getTime())) where.createdAt = { ...where.createdAt, lte: d };
  }
  return where;
}

export async function listRegistrationsForAdmin(opts: {
  q?: string;
  from?: string;
  to?: string;
  paymentStatus?: string;
  limit: number;
  offset: number;
}) {
  const where: Prisma.RegistrationWhereInput = buildDateFilter(opts.from, opts.to);
  if (opts.paymentStatus && ["paid", "manual", "pending", "refunded", REGISTRATION_PAYMENT_PENDING].includes(opts.paymentStatus)) {
    where.paymentStatus = opts.paymentStatus;
  } else if (!opts.paymentStatus) {
    where.paymentStatus = { in: [...ENROLLED_PAYMENT_STATUSES] };
  }

  let rows = await prisma.registration.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { trialZone: { select: { trialPlace: true, zone: true } } },
  });

  if (opts.q) {
    rows = rows.filter((row) => registrationMatchesQuery(row, opts.q!));
  }

  const total = rows.length;
  const items = rows.slice(opts.offset, opts.offset + opts.limit);
  return { items, total, limit: opts.limit, offset: opts.offset };
}
