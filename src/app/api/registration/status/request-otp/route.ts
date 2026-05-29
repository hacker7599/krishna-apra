import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { createRegistrationOtp } from "@/lib/registration-otp";
import { checkOtpRequestRate } from "@/lib/registration-status-rate-limit";
import { sendRegistrationOtpEmail } from "@/lib/send-registration-email";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email().max(200),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const limited = await checkOtpRequestRate(ip, email);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again.", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
    );
  }

  const registration = await prisma.registration.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!registration) {
    return NextResponse.json({
      ok: true,
      message: "If this email is registered, a 6-digit code has been sent. Check your inbox and spam folder.",
      maskedEmail: maskEmail(email),
    });
  }

  const otp = await createRegistrationOtp(email, registration.id);
  const mail = await sendRegistrationOtpEmail({
    registrationId: registration.id,
    email,
    playerName: registration.playerName,
    otp,
  });

  if (!mail.sent) {
    const status = mail.throttled ? 429 : 503;
    return NextResponse.json(
      {
        registered: true,
        error: mail.error || "Could not send verification email. Contact the league desk.",
        retryAfterSec: mail.retryAfterSec,
      },
      { status },
    );
  }

  return NextResponse.json({
    registered: true,
    ok: true,
    message: "A 6-digit code has been sent to your email.",
    maskedEmail: maskEmail(email),
  });
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const visible = user.length <= 2 ? user[0] + "*" : user.slice(0, 2) + "***";
  return `${visible}@${domain}`;
}
