import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** @deprecated Use POST /api/register/prepare — saves full registration before Razorpay. */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This payment endpoint is outdated. Submit the full registration form — your details are saved before Razorpay opens.",
    },
    { status: 410 },
  );
}
