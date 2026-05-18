"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Stats = {
  registrations: number;
  teams: number;
  banners: number;
  trialZones: number;
  publishedTeams: number;
  publishedBanners: number;
  publishedTrialZones: number;
};

export function AdminDashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/dashboard", { credentials: "include" });
    if (!res.ok) {
      setErr("Could not load dashboard.");
      return;
    }
    setErr("");
    setStats((await res.json()) as Stats);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, [load]);

  if (!stats && !err) {
    return <p className="text-sm font-semibold text-slate-600">Loading dashboard…</p>;
  }
  if (err) {
    return <p className="text-sm font-semibold text-rose-700">{err}</p>;
  }

  const s = stats!;

  const cards = [
    { label: "Trial registrations", value: s.registrations, href: "/admin/registrations", hint: "Search & date filters" },
    { label: "Teams (total)", value: s.teams, href: "/admin/teams", hint: `${s.publishedTeams} published on site` },
    { label: "Hero banners", value: s.banners, href: "/admin/banners", hint: `${s.publishedBanners} live on homepage` },
    { label: "Trial zones", value: s.trialZones, href: "/admin/trials", hint: `${s.publishedTrialZones} live on /trials` },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-bold italic tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm font-medium text-slate-600">Overview of league content and sign-ups.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className="mt-2 font-[family-name:var(--font-bebas)] text-4xl text-slate-900">{c.value}</p>
            <p className="mt-2 text-xs font-medium text-slate-600">{c.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
