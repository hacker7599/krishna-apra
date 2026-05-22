import { TRIAL_FEE_INR } from "@/lib/league";

export const TRIAL_FEE_PAISE = TRIAL_FEE_INR * 100;

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.trim() &&
      process.env.RAZORPAY_KEY_SECRET?.trim() &&
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim(),
  );
}

export function getRazorpayPublicKeyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ?? "";
}
