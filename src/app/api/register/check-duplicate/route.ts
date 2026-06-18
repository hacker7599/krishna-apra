import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { assertRegistrationOpenApi } from "@/lib/registration-api-guard";
import { getClientIp } from "@/lib/get-client-ip";
import { checkRegisterPostRate } from "@/lib/register-rate-limit";
import { normalizePhone } from "@/lib/normalize-phone";
import {
  enrolledDuplicateMessage,
  resolveContactForRegistration,
  resumeRegistrationMessage,
} from "@/lib/registration-contact-resolve";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().email().max(200),
  phone: z
    .string()
    .trim()
    .transform((s) => normalizePhone(s))
    .refine((s) => /^[0-9]{10}$/.test(s), { message: "Enter a valid 10-digit mobile number." }),
});

export async function POST(req: NextRequest) {
  const closed = assertRegistrationOpenApi();
  if (closed) return closed;

  const ip = getClientIp(req);
  const limited = await checkRegisterPostRate(ip);
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

  const resolved = await resolveContactForRegistration(parsed.data.email, parsed.data.phone);

  if (resolved.kind === "enrolled") {
    return NextResponse.json(
      {
        duplicate: true,
        matched: resolved.hit.matched,
        error: enrolledDuplicateMessage(resolved.hit),
      },
      { status: 409 },
    );
  }

  if (resolved.kind === "conflict") {
    return NextResponse.json({ duplicate: true, error: resolved.message }, { status: 409 });
  }

  if (resolved.kind === "pending") {
    return NextResponse.json({
      duplicate: false,
      resume: true,
      registrationId: resolved.id,
      message: resumeRegistrationMessage,
    });
  }

  return NextResponse.json({ duplicate: false });
}
