import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Razorpay confirmation is paused. Use QR payment screenshot flow and wait for admin approval.",
    },
    { status: 410 },
  );
}
