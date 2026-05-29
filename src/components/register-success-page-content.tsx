"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RegisterSuccessView } from "@/components/register-success-view";

export function RegisterSuccessPageContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token")?.trim() || undefined;

  const emailFailed = searchParams.get("emailSent") === "0";

  return (
    <div className="w-full max-w-[210mm]">
      {emailFailed ? (
        <div className="print-only-hide mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">Registration saved — confirmation email not sent</p>
          <p className="mt-1 text-xs leading-relaxed">
            Payment was successful but we could not deliver the email (SMTP may be misconfigured). Save or print this page
            now. The league desk can resend your confirmation email from admin.
          </p>
        </div>
      ) : null}
      <RegisterSuccessView token={tokenFromUrl} />
      {!tokenFromUrl ? (
        <p className="print-only-hide mt-4 text-center text-xs text-slate-500">
          Your confirmation is tied to this browser session. To open it on another device, use{" "}
          <Link href="/register/status" className="font-semibold text-orange-700 underline">
            registration status
          </Link>{" "}
          or the link in your email.
        </p>
      ) : null}
    </div>
  );
}
