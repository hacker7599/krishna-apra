import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/get-client-ip";
import { checkRegisterPostRate } from "@/lib/register-rate-limit";
import { duplicateRegistrationMessage, findExistingRegistration } from "@/lib/registration-duplicate";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(10).max(18),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = checkRegisterPostRate(ip);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later.", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and phone number." }, { status: 400 });
  }

  const existing = await findExistingRegistration(parsed.data.email, parsed.data.phone);
  if (existing) {
    return NextResponse.json(
      {
        duplicate: true,
        matched: existing.matched,
        error: duplicateRegistrationMessage(existing),
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ duplicate: false });
}
