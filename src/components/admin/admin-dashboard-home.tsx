"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { fetchDashboardCached, getCachedDashboard } from "@/lib/admin-dashboard-cache";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminStatCard } from "@/components/admin/ui/admin-stat-card";
import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { TRIAL_FEE_INR } from "@/lib/league";

type Stats = {
  registrations: number;
  teams: number;
  banners: number;
  trialZones: number;
  publishedTeams: number;
  publishedBanners: number;
  publishedTrialZones: number;
  payments: {
    paidOnline: number;
    manualRegistrations: number;
    orphanPayments: number;
    paymentOrdersTotal: number;
    revenuePaise: number;
  };
  recentRegistrations: Array<{
    id: string;
    createdAt: string;
    playerName: string;
    academyName: string;
    paymentStatus: string | null;
    email: string;
  }>;
};

function formatInr(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    paise / 100,
  );
}

export function AdminDashboardHome() {
  const [stats, setStats] = useState<Stats | null>(() => getCachedDashboard() as Stats | null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const data = await fetchDashboardCached(() => adminFetch("/api/admin/dashboard"));
    if (!data) {
      setErr("Could not load dashboard.");
      return;
    }
    setErr("");
    setStats(data as Stats);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!stats && !err) {
    return (
      <div className="admin-panel mx-auto max-w-7xl space-y-6 animate-pulse">
        <div className="h-10 w-48 rounded-lg bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }
  if (err) {
    return <p className="text-sm font-semibold text-rose-700">{err}</p>;
  }

  const s = stats!;
  const p = s.payments;

  return (
    <div className="admin-panel mx-auto max-w-7xl space-y-10">
      <AdminPageHeader
        title="Command center"
        description="Real-time overview for Future Star U-15 trial operations, payments, and public site content."
      />

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Registrations & revenue</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Total registrations" value={s.registrations} href="/admin/registrations" accent="navy" />
          <AdminStatCard label="Paid online (Razorpay)" value={p.paidOnline} accent="green" />
          <AdminStatCard label="Manual / offline" value={p.manualRegistrations} accent="orange" />
          <AdminStatCard
            label="Revenue collected"
            value={formatInr(p.revenuePaise)}
            hint={`${TRIAL_FEE_INR} × paid online`}
            href="/admin/payments"
            accent="green"
          />
        </div>
      </section>

      {p.orphanPayments > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>{p.orphanPayments}</strong> payment{p.orphanPayments === 1 ? "" : "s"} received without a linked registration.{" "}
          <Link href="/admin/payments" className="font-semibold underline">
            Review in Payments →
          </Link>
        </div>
      ) : null}

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Site content</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminStatCard label="Teams" value={s.teams} hint={`${s.publishedTeams} published`} href="/admin/teams" />
          <AdminStatCard label="Hero banners" value={s.banners} hint={`${s.publishedBanners} live`} href="/admin/banners" />
          <AdminStatCard label="Trial zones" value={s.trialZones} hint={`${s.publishedTrialZones} live`} href="/admin/trials" />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-bold text-[#1B365D]">Recent registrations</h2>
          <Link href="/admin/registrations" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {s.recentRegistrations.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-500">No registrations yet.</li>
          ) : (
            s.recentRegistrations.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5 hover:bg-slate-50/80">
                <div>
                  <p className="font-medium text-slate-900">{r.playerName}</p>
                  <p className="text-xs text-slate-500">
                    {r.academyName} · {r.email}
                  </p>
                </div>
                <AdminBadge status={r.paymentStatus} />
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
