import { SignJWT, jwtVerify } from "jose";
import { getRegistrationSigningSecret } from "@/lib/secrets";

function getSecret() {
  return new TextEncoder().encode(getRegistrationSigningSecret());
}

export async function signRegistrationConfirmationToken(registrationId: string): Promise<string> {
  return new SignJWT({ typ: "reg_confirm" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(registrationId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyRegistrationConfirmationToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.typ !== "reg_confirm" || typeof payload.sub !== "string" || !payload.sub) {
      return null;
    }
    return payload.sub;
  } catch {
    return null;
  }
}
