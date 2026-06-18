import { NextResponse } from "next/server";
import { isRegistrationOpen, REGISTRATION_CLOSED_MESSAGE } from "@/lib/registration-gate";

export function registrationClosedApiResponse() {
  return NextResponse.json({ error: REGISTRATION_CLOSED_MESSAGE }, { status: 403 });
}

/** Returns a 403 response when registration is closed; otherwise null. */
export function assertRegistrationOpenApi(): NextResponse | null {
  if (!isRegistrationOpen()) return registrationClosedApiResponse();
  return null;
}
