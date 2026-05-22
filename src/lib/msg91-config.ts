export function isMsg91EmailConfigured(): boolean {
  return Boolean(process.env.MSG91_AUTH_KEY?.trim() && process.env.MSG91_EMAIL_DOMAIN?.trim());
}

export function getMsg91Config() {
  const authKey = process.env.MSG91_AUTH_KEY?.trim();
  const domain = process.env.MSG91_EMAIL_DOMAIN?.trim();
  const fromEmail = process.env.MSG91_EMAIL_FROM?.trim();
  const fromName = process.env.MSG91_EMAIL_FROM_NAME?.trim() || "Future Star U-15";

  if (!authKey || !domain) {
    throw new Error("MSG91_AUTH_KEY and MSG91_EMAIL_DOMAIN must be set.");
  }

  return {
    authKey,
    domain,
    fromEmail: fromEmail || `noreply@${domain}`,
    fromName,
    templateRegistration: process.env.MSG91_TEMPLATE_REGISTRATION_CONFIRMATION?.trim() || "",
    templateOtp: process.env.MSG91_TEMPLATE_REGISTRATION_OTP?.trim() || "",
    apiUrl: process.env.MSG91_EMAIL_API_URL?.trim() || "https://control.msg91.com/api/v5/email/send",
  };
}
