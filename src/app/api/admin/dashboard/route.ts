import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { paidOrphanPaymentOrderFilter } from "@/lib/payment-order-registration-lookup";
import {
  AWAITING_VERIFICATION_PAYMENT_STATUSES,
  ENROLLED_PAYMENT_STATUSES,
  REGISTRATION_PAYMENT_MANUAL,
} from "@/lib/registration-payment-status";
import { TRIAL_FEE_PAISE } from "@/lib/razorpay-config";
import { countTrialSchedules } from "@/lib/trial-schedule-db";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    registrations,
    teams,
    banners,
    trialZones,
    trialSchedules,
    publishedTeams,
    publishedBanners,
    publishedTrialZones,
    publishedTrialSchedules,
    paidOnline,
    pendingOrManualRegistrations,
    orphanPayments,
    paymentOrdersTotal,
    recentRegistrations,
  ] = await Promise.all([
    prisma.registration.count({ where: { paymentStatus: { in: [...ENROLLED_PAYMENT_STATUSES] } } }),
    prisma.team.count(),
    prisma.heroBanner.count(),
    prisma.trialZone.count(),
    countTrialSchedules(),
    prisma.team.count({ where: { published: true } }),
    prisma.heroBanner.count({ where: { published: true } }),
    prisma.trialZone.count({ where: { published: true } }),
    countTrialSchedules({ published: true }),
    prisma.registration.count({ where: { paymentStatus: "paid" } }),
    prisma.registration.count({
      where: {
        paymentStatus: {
          in: [REGISTRATION_PAYMENT_MANUAL, ...AWAITING_VERIFICATION_PAYMENT_STATUSES],
        },
      },
    }),
    prisma.paymentOrder.count({ where: await paidOrphanPaymentOrderFilter() }),
    prisma.paymentOrder.count(),
    prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        createdAt: true,
        playerName: true,
        academyName: true,
        paymentStatus: true,
        email: true,
      },
    }),
  ]);

  const revenuePaise = paidOnline * TRIAL_FEE_PAISE;

  return NextResponse.json({
    registrations,
    teams,
    banners,
    trialZones,
    trialSchedules,
    publishedTeams,
    publishedBanners,
    publishedTrialZones,
    publishedTrialSchedules,
    payments: {
      paidOnline,
      manualRegistrations: pendingOrManualRegistrations,
      orphanPayments,
      paymentOrdersTotal,
      revenuePaise,
    },
    recentRegistrations,
  });
}
