import { checkRateLimit } from "@/lib/rate-limit-db";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 10;

export function checkCreateOrderRate(ip: string) {
  return checkRateLimit(`pay-order:ip:${ip}`, MAX_PER_IP, WINDOW_MS);
}
