import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Razorpay webhook processing is paused while QR screenshot verification flow is active.",
    },
    { status: 410 },
  );
}
