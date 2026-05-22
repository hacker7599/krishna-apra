import { NextResponse } from "next/server";
import { getRazorpayPublicKeyId, isRazorpayConfigured, TRIAL_FEE_PAISE } from "@/lib/razorpay-config";
import { TRIAL_FEE_INR } from "@/lib/league";

export const runtime = "nodejs";

export async function GET() {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ enabled: false });
  }
  return NextResponse.json({
    enabled: true,
    keyId: getRazorpayPublicKeyId(),
    amountPaise: TRIAL_FEE_PAISE,
    amountInr: TRIAL_FEE_INR,
    currency: "INR",
  });
}
