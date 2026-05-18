type Entry = { failures: number; lockUntil: number };

const store = new Map<string, Entry>();
const MAX_FAILS = 8;
const LOCK_MS = 10 * 60 * 1000;

export function checkLoginRate(ip: string): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  const e = store.get(ip);
  if (e && e.lockUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((e.lockUntil - now) / 1000) };
  }
  return { allowed: true };
}

export function recordLoginFailure(ip: string) {
  const now = Date.now();
  let e = store.get(ip);
  if (e && e.lockUntil > now) return;
  if (!e || e.lockUntil <= now) {
    e = { failures: 0, lockUntil: 0 };
  }
  e.failures += 1;
  if (e.failures >= MAX_FAILS) {
    e.lockUntil = now + LOCK_MS;
    e.failures = 0;
  }
  store.set(ip, e);
}

export function resetLoginFailures(ip: string) {
  store.delete(ip);
}
