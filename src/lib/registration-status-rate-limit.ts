import { checkRateLimit } from "@/lib/rate-limit-db";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 20;
const MAX_PER_EMAIL = 5;

export function checkOtpRequestRate(ip: string, email: string) {
  const byIp = checkRateLimit(`otp-req:ip:${ip}`, MAX_PER_IP, WINDOW_MS);
  return byIp.then((r) => {
    if (!r.allowed) return r;
    return checkRateLimit(`otp-req:email:${email.toLowerCase()}`, MAX_PER_EMAIL, WINDOW_MS);
  });
}

const VERIFY_MAX_IP = 30;
const VERIFY_MAX_EMAIL = 10;

export function checkOtpVerifyRate(ip: string, email: string) {
  const byIp = checkRateLimit(`otp-verify:ip:${ip}`, VERIFY_MAX_IP, WINDOW_MS);
  return byIp.then((r) => {
    if (!r.allowed) return r;
    return checkRateLimit(`otp-verify:email:${email.toLowerCase()}`, VERIFY_MAX_EMAIL, WINDOW_MS);
  });
}
