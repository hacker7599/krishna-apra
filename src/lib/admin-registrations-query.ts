import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  AWAITING_VERIFICATION_PAYMENT_STATUSES,
  ENROLLED_PAYMENT_STATUSES,
  REGISTRATION_PAYMENT_PENDING,
} from "@/lib/registration-payment-status";

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
    (ext.razorpayOrderId?.includes(q) ?? false) ||
    ((row as { registrationCode?: string | null }).registrationCode?.toLowerCase().includes(n) ?? false) ||
    ((row as { paymentCode?: string | null }).paymentCode?.toLowerCase().includes(n) ?? false)
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

function applyPaymentStatusFilter(
  where: Prisma.RegistrationWhereInput,
  paymentStatus?: string,
): void {
  const normalizedPaymentStatus =
    paymentStatus === "pending" ? REGISTRATION_PAYMENT_PENDING : paymentStatus;
  if (normalizedPaymentStatus === REGISTRATION_PAYMENT_PENDING) {
    where.paymentStatus = { in: [...AWAITING_VERIFICATION_PAYMENT_STATUSES] };
  } else if (normalizedPaymentStatus === "enrolled") {
    where.paymentStatus = { in: [...ENROLLED_PAYMENT_STATUSES] };
  } else if (
    normalizedPaymentStatus &&
    ["paid", "manual", "refunded"].includes(normalizedPaymentStatus)
  ) {
    where.paymentStatus = normalizedPaymentStatus;
  }
}

export const ADMIN_REGISTRATIONS_EXPORT_MAX = 25_000;

export async function listRegistrationsForAdmin(opts: {
  q?: string;
  from?: string;
  to?: string;
  paymentStatus?: string;
  trialZoneId?: string;
  limit: number;
  offset: number;
}) {
  const where: Prisma.RegistrationWhereInput = buildDateFilter(opts.from, opts.to);
  applyPaymentStatusFilter(where, opts.paymentStatus);
  if (opts.trialZoneId) {
    where.trialZoneId = opts.trialZoneId;
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
  const page = rows.slice(opts.offset, opts.offset + opts.limit);
  const items = await attachPaymentOrderStatus(page);

  return { items, total, limit: opts.limit, offset: opts.offset };
}

/** All rows matching filters (for CSV export), capped at ADMIN_REGISTRATIONS_EXPORT_MAX. */
export async function listRegistrationsForAdminExport(opts: {
  q?: string;
  from?: string;
  to?: string;
  paymentStatus?: string;
  trialZoneId?: string;
}) {
  const where: Prisma.RegistrationWhereInput = buildDateFilter(opts.from, opts.to);
  applyPaymentStatusFilter(where, opts.paymentStatus);
  if (opts.trialZoneId) {
    where.trialZoneId = opts.trialZoneId;
  }

  let rows = await prisma.registration.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { trialZone: { select: { trialPlace: true, zone: true } } },
  });

  if (opts.q) {
    rows = rows.filter((row) => registrationMatchesQuery(row, opts.q!));
  }

  const truncated = rows.length > ADMIN_REGISTRATIONS_EXPORT_MAX;
  if (truncated) {
    rows = rows.slice(0, ADMIN_REGISTRATIONS_EXPORT_MAX);
  }

  return { rows, total: rows.length, truncated };
}

export type RegistrationAdminListItem = RegistrationListRow & {
  paymentOrderStatus: string | null;
};

async function attachPaymentOrderStatus(rows: RegistrationListRow[]): Promise<RegistrationAdminListItem[]> {
  if (rows.length === 0) return [];

  const regIds = rows.map((r) => r.id);
  const orders = await prisma.paymentOrder.findMany({
    where: { registrationId: { in: regIds } },
    select: { registrationId: true, status: true },
    orderBy: { createdAt: "desc" },
  });

  const statusByRegId = new Map<string, string>();
  for (const o of orders) {
    if (o.registrationId && !statusByRegId.has(o.registrationId)) {
      statusByRegId.set(o.registrationId, o.status);
    }
  }

  return rows.map((row) => ({
    ...row,
    paymentOrderStatus: statusByRegId.get(row.id) ?? null,
  }));
}
