"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setAdminCsrf } from "@/lib/admin-client";
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
      if (typeof data.csrfToken === "string") {
        setAdminCsrf(data.csrfToken);
        sessionStorage.setItem("fs_admin_user", typeof data.username === "string" ? data.username : username);
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
    <div className="admin-login-card">
      <div className="admin-login-card__bar" aria-hidden />
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <Image src={LEAGUE_LOGO_SRC} alt="" fill className="object-contain" sizes="48px" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">Future Star U-15</p>
            <h1>League desk</h1>
          </div>
        </div>
        <div className="mt-5 w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <Image src={KRISHNA_APRA_LOGO_SRC} alt="Krishna Apra" width={280} height={96} unoptimized className="mx-auto h-16 w-auto object-contain" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-500">Authorized staff only</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-5 border-t border-slate-100 pt-6">
        <label className="block">
          <span className="admin-label">Username</span>
          <input
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="admin-input w-full"
            required
          />
        </label>
        <label className="block">
          <span className="admin-label">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input w-full"
            required
          />
        </label>
        {err ? <p className="admin-alert admin-alert--error">{err}</p> : null}
        <button type="submit" disabled={loading} className="admin-btn admin-btn--primary">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
