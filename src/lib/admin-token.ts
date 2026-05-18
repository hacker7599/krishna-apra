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

export async function signAdminSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyAdminSessionToken(token: string) {
  let secret: Uint8Array;
  try {
    secret = getSecret();
  } catch {
    return false;
  }
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "admin";
  } catch {
    return false;
  }
}
