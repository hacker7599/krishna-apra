"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Status = {
  configured: boolean;
  setupAllowed: boolean;
};

export function AdminSetupForm() {
  const [status, setStatus] = useState<Status | null>(null);
  const [setupSecret, setSetupSecret] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((d) => setStatus(d as Status))
      .catch(() => setErr("Could not load setup status."));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupSecret, username, password, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Setup failed.");
        return;
      }
      setMsg(typeof data.message === "string" ? data.message : "Password saved. You can sign in now.");
      setPassword("");
      setConfirmPassword("");
      setStatus((await fetch("/api/admin/setup").then((r) => r.json())) as Status);
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (!status) {
    return <p className="text-sm font-semibold text-slate-600">Loading setup status…</p>;
  }

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
      <ul className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-700">
        <li>
          Admin password:{" "}
          <span className={status.configured ? "font-bold text-emerald-700" : "font-bold text-amber-700"}>
            {status.configured ? "Configured" : "Not configured"}
          </span>
        </li>
        <li>
          Setup page:{" "}
          <span className={status.setupAllowed ? "font-bold text-emerald-700" : "font-bold text-rose-700"}>
            {status.setupAllowed ? "Enabled" : "Disabled — set ADMIN_SETUP_SECRET in .env"}
          </span>
        </li>
      </ul>

      {!status.setupAllowed ? (
        <p className="text-sm leading-relaxed text-slate-700">
          On your server, add to <code className="rounded bg-slate-100 px-1">.env</code>:{" "}
          <code className="rounded bg-slate-100 px-1">ADMIN_SETUP_SECRET=your-long-random-secret</code> (at least 16 characters), then restart
          the app and reload this page.
        </p>
      ) : status.configured ? (
        <p className="text-sm text-slate-700">
          Admin is already configured. Sign in at{" "}
          <Link href="/admin/login" className="font-semibold text-[#1B365D] underline">
            /admin/login
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Setup secret</span>
            <input
              type="password"
              value={setupSecret}
              onChange={(e) => setSetupSecret(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium"
              required
              autoComplete="off"
              placeholder="Same as ADMIN_SETUP_SECRET on server"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Admin username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium"
              required
              minLength={2}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">New password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          {err && <p className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900">{err}</p>}
          {msg && <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">{msg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1B365D] py-3 text-sm font-semibold text-white hover:bg-[#152a4a] disabled:opacity-60"
          >
            {loading ? "Saving…" : "Create admin password"}
          </button>
        </form>
      )}

      <p className="text-center text-sm font-semibold">
        <Link href="/admin/login" className="text-[#1B365D] underline hover:text-[#152a4a]">
          Back to admin sign-in
        </Link>
      </p>
    </div>
  );
}
