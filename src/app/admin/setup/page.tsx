import type { Metadata } from "next";
import { AdminSetupForm } from "@/components/admin-setup-form";

export const metadata: Metadata = {
  title: "Setup",
  robots: { index: false, follow: false },
};

export default function AdminSetupPage() {
  return (
    <div className="admin-login-page">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Future Star U-15</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#1B365D]">Initial setup</h1>
          <p className="mt-1 text-sm text-slate-600">Server configuration only — not linked from the public site.</p>
        </div>
        <AdminSetupForm />
      </div>
    </div>
  );
}
