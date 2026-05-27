import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** @deprecated Use POST /api/register/prepare — saves full registration before Razorpay. */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This payment endpoint is paused. Please use registration QR payment and upload screenshot proof.",
    },
    { status: 410 },
  );
}
