/** Normalize to digits only; for Indian mobiles keeps last 10 digits when longer. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 10) return digits;
  return digits.slice(-10);
}
