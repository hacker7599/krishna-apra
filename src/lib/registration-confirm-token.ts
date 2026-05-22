import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const dedicated = process.env.REGISTRATION_TOKEN_SECRET?.trim();
  const s = dedicated || process.env.ADMIN_JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error("REGISTRATION_TOKEN_SECRET or ADMIN_JWT_SECRET (32+ chars) must be set.");
  }
  return new TextEncoder().encode(s);
}

export async function signRegistrationConfirmationToken(registrationId: string): Promise<string> {
  return new SignJWT({ typ: "reg_confirm" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(registrationId)
    .setIssuedAt()
    .setExpirationTime("30d")
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
