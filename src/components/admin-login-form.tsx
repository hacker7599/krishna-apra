"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="grid w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-5">
      <div className="relative hidden min-h-[280px] bg-slate-100 sm:col-span-2 sm:block">
        <Image src="/branding/logo.png" alt="" fill className="object-contain p-6" sizes="240px" />
      </div>
      <form onSubmit={onSubmit} className="flex flex-col justify-center space-y-5 p-6 sm:col-span-3 sm:p-10">
        <div className="flex justify-center sm:hidden">
          <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <Image src="/branding/logo.png" alt="Future Star U15" fill className="object-cover" sizes="80px" />
          </div>
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-bold italic tracking-tight text-slate-900">Admin sign-in</h1>
          <p className="mt-1 text-sm font-medium text-slate-600">Registrations dashboard (secure session cookie)</p>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Username</span>
          <input
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            required
          />
        </label>
        {err && <p className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-600 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
