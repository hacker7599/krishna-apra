"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KRISHNA_APRA_LOGO_SRC, LEAGUE_LOGO_SRC } from "@/lib/branding";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429 && typeof data.retryAfterSec === "number") {
          setErr(`Too many attempts. Retry in ${data.retryAfterSec}s.`);
        } else {
          setErr(typeof data.error === "string" ? data.error : "Login failed.");
        }
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center sm:items-start sm:text-left">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <Image src={LEAGUE_LOGO_SRC} alt="" fill className="object-contain" sizes="48px" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Future Star U-15</p>
            <h1 className="text-xl font-semibold text-[#1B365D]">League desk</h1>
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Image src={KRISHNA_APRA_LOGO_SRC} alt="Krishna Apra" width={320} height={128} unoptimized className="mx-auto h-20 w-auto max-w-full object-contain sm:mx-0 sm:h-24" />
        </div>
        <p className="mt-3 text-sm text-slate-500">Authorized staff only</p>
      </div>
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
        <div className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Username</span>
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#1B365D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#1B365D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15"
              required
            />
          </label>
          {err && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{err}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1B365D] py-2.5 text-sm font-semibold text-white transition hover:bg-[#152a4a] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
