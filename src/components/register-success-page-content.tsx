"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { RegisterSuccessView } from "@/components/register-success-view";

export function RegisterSuccessPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return (
      <div className="max-w-lg rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
        <p className="text-sm font-semibold text-amber-950">No confirmation link found. Complete registration from the form first.</p>
        <Link href="/register" className="mt-4 inline-block text-sm font-bold text-orange-600 underline hover:text-orange-700">
          Go to registration
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[210mm]">
      <RegisterSuccessView token={token} />
    </div>
  );
}
