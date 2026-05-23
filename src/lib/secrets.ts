/** Shared secret for registration JWTs and OTP hashing (must be separate from admin JWT in production). */
export function getRegistrationSigningSecret(): string {
  const dedicated = process.env.REGISTRATION_TOKEN_SECRET?.trim();
  const fallback = process.env.ADMIN_JWT_SECRET?.trim();

  if (process.env.NODE_ENV === "production") {
    if (!dedicated || dedicated.length < 32) {
      throw new Error("REGISTRATION_TOKEN_SECRET (32+ characters) is required in production.");
    }
    return dedicated;
  }

  const s = dedicated || fallback;
  if (!s || s.length < 32) {
    throw new Error("Set REGISTRATION_TOKEN_SECRET (recommended) or ADMIN_JWT_SECRET (32+ characters).");
  }
  return s;
}
