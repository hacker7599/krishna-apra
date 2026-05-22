import { randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "fs_admin";

function getSecret() {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ADMIN_JWT_SECRET must be set and at least 32 characters.");
  }
  return new TextEncoder().encode(s);
}

export { COOKIE_NAME };

export type AdminSession = {
  role: "admin";
  csrf: string;
};

export async function signAdminSessionToken(): Promise<{ token: string; csrf: string }> {
  const csrf = randomBytes(24).toString("hex");
  const token = await new SignJWT({ role: "admin", csrf })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
  return { token, csrf };
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSession | null> {
  let secret: Uint8Array;
  try {
    secret = getSecret();
  } catch {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin" || typeof payload.csrf !== "string" || !payload.csrf) {
      return null;
    }
    return { role: "admin", csrf: payload.csrf };
  } catch {
    return null;
  }
}
