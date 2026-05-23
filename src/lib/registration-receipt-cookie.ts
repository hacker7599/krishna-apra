import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { adminCookieSecure } from "@/lib/request-is-https";

export const REGISTRATION_RECEIPT_COOKIE = "fs_reg_receipt";

/** 7 days — matches JWT expiry for receipt access */
const MAX_AGE_SEC = 7 * 24 * 60 * 60;

export function attachRegistrationReceiptCookie(res: NextResponse, token: string, req: NextRequest): void {
  res.cookies.set(REGISTRATION_RECEIPT_COOKIE, token, {
    httpOnly: true,
    secure: adminCookieSecure(req),
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

/** Cookie first (post-registration browser session), then ?token= for email / OTP links. */
export function getRegistrationReceiptToken(req: NextRequest): string | null {
  const fromCookie = req.cookies.get(REGISTRATION_RECEIPT_COOKIE)?.value?.trim();
  if (fromCookie) return fromCookie;
  const fromQuery = new URL(req.url).searchParams.get("token")?.trim();
  return fromQuery || null;
}
