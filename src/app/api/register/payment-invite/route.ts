import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loadValidPaymentInvite } from "@/lib/registration-payment-invite";
import { TRIAL_FEE_INR } from "@/lib/league";
import type { RoleId } from "@/lib/league";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
  }

  const loaded = await loadValidPaymentInvite(token);
  if (!loaded.ok) {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status });
  }

  const { registration } = loaded.ctx;
  let roles: RoleId[] = [];
  try {
    const parsed = JSON.parse(registration.roles) as unknown;
    if (Array.isArray(parsed)) roles = parsed as RoleId[];
  } catch {
    /* ignore */
  }

  return NextResponse.json({
    ok: true,
    registration: {
      id: registration.id,
      playerName: registration.playerName,
      academyName: registration.academyName,
      email: registration.email,
      phone: registration.phone,
      dateOfBirth: registration.dateOfBirth.toISOString().slice(0, 10),
      roles,
      trialZone: registration.trialZone
        ? { trialPlace: registration.trialZone.trialPlace, zone: registration.trialZone.zone }
        : null,
      registrationCode: registration.registrationCode,
      jerseySize: registration.jerseySize,
      fatherName: registration.fatherName,
    },
    feeInr: TRIAL_FEE_INR,
    expiresAt: loaded.ctx.invite.expiresAt.toISOString(),
  });
}
