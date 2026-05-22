import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { toRegistrationConfirmation } from "@/lib/registration-confirmation";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Confirmation link is invalid." }, { status: 400 });
  }

  const registrationId = await verifyRegistrationConfirmationToken(token);
  if (!registrationId) {
    return NextResponse.json({ error: "This confirmation link has expired or is invalid." }, { status: 401 });
  }

  const row = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!row) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  return NextResponse.json(toRegistrationConfirmation(row));
}
