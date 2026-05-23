"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RegisterSuccessView } from "@/components/register-success-view";

function ReceiptContent() {
  const tokenFromUrl = useSearchParams().get("token")?.trim() || undefined;
  return <RegisterSuccessView token={tokenFromUrl} minimal />;
}

export function RegistrationReceiptOnly() {
  return (
    <div className="mx-auto w-full max-w-[210mm] px-4 py-10 sm:px-6 print:px-0 print:py-0">
      <Suspense fallback={<p className="text-center text-sm font-semibold text-slate-600">Loading…</p>}>
        <ReceiptContent />
      </Suspense>
    </div>
  );
}
