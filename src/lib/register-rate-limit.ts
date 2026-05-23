import { checkRateLimit } from "@/lib/rate-limit-db";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_POSTS_PER_WINDOW = 12;

/** Limits POST /api/register per IP to reduce spam and DB fills. */
export function checkRegisterPostRate(ip: string) {
  return checkRateLimit(`register:ip:${ip}`, MAX_POSTS_PER_WINDOW, WINDOW_MS);
}
