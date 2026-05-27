import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { paidOrphanPaymentOrderFilter } from "@/lib/payment-order-registration-lookup";
import { ENROLLED_PAYMENT_STATUSES } from "@/lib/registration-payment-status";
import { TRIAL_FEE_PAISE } from "@/lib/razorpay-config";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    registrations,
    teams,
    banners,
    trialZones,
    publishedTeams,
    publishedBanners,
    publishedTrialZones,
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
    prisma.team.count({ where: { published: true } }),
    prisma.heroBanner.count({ where: { published: true } }),
    prisma.trialZone.count({ where: { published: true } }),
    prisma.registration.count({ where: { paymentStatus: "paid" } }),
    prisma.registration.count({ where: { paymentStatus: { in: ["manual", "pending"] } } }),
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
    publishedTeams,
    publishedBanners,
    publishedTrialZones,
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
