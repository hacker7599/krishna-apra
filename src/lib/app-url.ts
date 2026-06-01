/** Canonical public site URL for links in emails (no trailing slash). Set APP_URL on the server. */
export function getAppBaseUrl(): string {
  const explicit = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export function registrationReceiptUrl(token: string): string {
  return `${getAppBaseUrl()}/register/receipt?token=${encodeURIComponent(token)}`;
}

export function registrationStatusUrl(): string {
  return `${getAppBaseUrl()}/register/status`;
}

export function registrationPayUrl(): string {
  return `${getAppBaseUrl()}/register`;
}
