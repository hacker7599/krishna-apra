const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 20;
const MAX_PER_EMAIL = 5;

const ipHits = new Map<string, number[]>();
const emailHits = new Map<string, number[]>();

function check(map: Map<string, number[]>, key: string, max: number): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  let arr = map.get(key) ?? [];
  arr = arr.filter((t) => now - t < WINDOW_MS);
  if (arr.length >= max) {
    const oldest = arr[0]!;
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000)) };
  }
  arr.push(now);
  map.set(key, arr);
  return { allowed: true };
}

export function checkOtpRequestRate(ip: string, email: string) {
  const byIp = check(ipHits, ip, MAX_PER_IP);
  if (!byIp.allowed) return byIp;
  return check(emailHits, email.toLowerCase(), MAX_PER_EMAIL);
}
