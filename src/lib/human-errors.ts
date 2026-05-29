/** Turn API / validation errors into plain language for admins and players. */

const EXACT: Record<string, string> = {
  Unauthorized: "Your session has expired. Please sign in again.",
  Forbidden:
    "Your session may have expired or the security token is out of date. Sign out, sign in again, then retry.",
  "Not found": "We could not find that record. It may have been removed.",
  "Invalid JSON": "Something went wrong with the request. Please refresh the page and try again.",
  "Could not load registrations.": "We could not load the registration list. Refresh the page or sign in again.",
  "Could not load registration.": "We could not open this registration. Refresh the page or try again.",
  "Could not load receipt.": "We could not prepare the printable receipt. Check your connection and try again.",
  "Create failed.": "We could not save the new registration. Check the form and try again.",
  "Save failed.": "Your changes were not saved. Check the form and try again.",
  "Delete failed.": "We could not delete this registration. Try again in a moment.",
  "Something went wrong.": "Something went wrong on our side. Please try again in a moment.",
  "The system is busy saving your information. Please wait a moment and try again.":
    "The system is busy saving your information. Please wait a moment and try again.",
  "Registration services are temporarily unavailable. Please try again in a few minutes.":
    "Registration services are temporarily unavailable. Please try again in a few minutes.",
  "Network error. Please try again.": "Your internet connection may be down. Check your network and try again.",
  "Email service not configured": "Email is not configured. Add SMTP settings in .env and restart the server.",
  "Payment was not completed. Your registration was not submitted.":
    "Payment was cancelled or failed, so your registration was not submitted. You can try again.",
  "Please select a valid trial zone.": "Please choose a trial venue from the list.",
  "Government ID proof upload is required (Aadhaar, passport, or birth certificate).":
    "Please upload a photo or scan of your ID (Aadhaar, passport, or birth certificate).",
};

function firstZodFieldMessage(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const fieldErrors = (details as { fieldErrors?: Record<string, string[] | undefined> }).fieldErrors;
  if (!fieldErrors) return null;
  for (const messages of Object.values(fieldErrors)) {
    const msg = messages?.find((m) => typeof m === "string" && m.trim());
    if (msg) return msg;
  }
  const formErrors = (details as { formErrors?: string[] }).formErrors;
  const formMsg = formErrors?.find((m) => typeof m === "string" && m.trim());
  return formMsg ?? null;
}

function isEmailDeliveryError(raw: string): boolean {
  const lower = raw.toLowerCase();
  return (
    lower.includes("smtp") ||
    lower.includes("mailer") ||
    lower.includes("nodemailer") ||
    lower.includes("invalid login") ||
    lower.includes("authentication failed") ||
    lower.includes("username and password not accepted") ||
    lower.includes("email service not configured") ||
    lower.includes("email is not configured") ||
    lower.includes("could not be sent") ||
    lower.includes("econnrefused") ||
    lower.includes("etimedout") ||
    lower.includes("enotfound") ||
    /\b5\d{2}\b/.test(lower)
  );
}

function softenTechnical(raw: string): string {
  const t = raw.trim();
  if (!t) return "";

  if (/please wait \d+ second/i.test(t)) {
    return t;
  }

  if (isEmailDeliveryError(t)) {
    if (/not configured/i.test(t)) {
      return "Email is not configured on the server. Add SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in .env, then restart the app.";
    }
    if (/invalid login|authentication|535|username and password/i.test(t)) {
      return "The mail server rejected the SMTP login. Check SMTP_USER and SMTP_PASSWORD in .env.";
    }
    if (/certificate|tls|ssl/i.test(t)) {
      return "Could not connect to the mail server securely. Check SMTP_HOST, SMTP_PORT, and SMTP_SECURE in .env.";
    }
    return t.length <= 240 ? t : `${t.slice(0, 237)}…`;
  }

  if (/^invalid/i.test(t) && t.length < 80 && !/invalid login/i.test(t)) {
    return "Some details on the form are not valid. Please check the highlighted fields.";
  }
  if (/file.*too large|under 4 mb/i.test(t)) {
    return "That file is too large. Please use a smaller image or PDF (under 4 MB).";
  }
  if (/file.*type|jpg|png|webp|pdf/i.test(t)) {
    return "That file type is not allowed. Use the formats shown under the upload button.";
  }
  if (/duplicate|already registered/i.test(t)) {
    return t;
  }
  if (/too many attempts|try again in \d+s/i.test(t)) {
    return t;
  }
  if (/rate limit/i.test(t)) {
    return "Too many attempts. Please wait a minute and try again.";
  }

  return t;
}

/**
 * Best message to show the user from an API JSON body.
 */
export function humanErrorFromResponse(
  body: { error?: unknown; details?: unknown; message?: unknown },
  fallback: string,
): string {
  const zod = firstZodFieldMessage(body.details);
  if (zod) return softenTechnical(zod) || zod;

  const raw =
    typeof body.error === "string"
      ? body.error
      : typeof body.message === "string"
        ? body.message
        : undefined;

  if (raw && EXACT[raw]) return EXACT[raw];
  if (raw) {
    const softened = softenTechnical(raw);
    if (softened && softened.length <= 200) return softened;
  }

  return fallback;
}

export function humanErrorMessage(raw: string | undefined, fallback: string): string {
  if (!raw?.trim()) return fallback;
  if (EXACT[raw]) return EXACT[raw];
  const softened = softenTechnical(raw);
  return softened && softened.length <= 200 ? softened : fallback;
}

export function humanErrorFromThrown(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) {
    return humanErrorMessage(err.message, fallback);
  }
  return fallback;
}
