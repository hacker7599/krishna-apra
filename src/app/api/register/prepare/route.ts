import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Online Razorpay checkout is paused. Please use the registration form QR payment flow and upload your payment screenshot.",
    },
    { status: 410 },
  );
}
