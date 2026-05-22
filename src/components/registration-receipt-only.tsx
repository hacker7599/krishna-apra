"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RegisterSuccessView } from "@/components/register-success-view";

/** Printable receipt only — no site navigation links */
function ReceiptContent() {
  const token = useSearchParams().get("token")?.trim();
  if (!token) {
    return (
      <p className="text-center text-sm font-semibold text-slate-600">
        Invalid or missing access link. Use registration status to verify your email.
      </p>
    );
  }
  return <RegisterSuccessView token={token} minimal />;
}

export function RegistrationReceiptOnly() {
  return (
    <div className={`mx-auto w-full max-w-[210mm] px-4 py-10 sm:px-6 print:px-0 print:py-0`}>
      <Suspense fallback={<p className="text-center text-sm font-semibold text-slate-600">Loading…</p>}>
        <ReceiptContent />
      </Suspense>
    </div>
  );
}
