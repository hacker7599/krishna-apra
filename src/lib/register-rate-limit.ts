const WINDOW_MS = 15 * 60 * 1000;
const MAX_POSTS_PER_WINDOW = 12;
const PRUNE_AT = 8000;

const hits = new Map<string, number[]>();

function prune(now: number) {
  if (hits.size < PRUNE_AT) return;
  for (const [ip, ts] of hits) {
    const next = ts.filter((t) => now - t < WINDOW_MS);
    if (next.length === 0) hits.delete(ip);
    else hits.set(ip, next);
  }
}

/** Limits POST /api/register per IP to reduce spam and DB fills on a small host. */
export function checkRegisterPostRate(ip: string): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  let arr = hits.get(ip) ?? [];
  arr = arr.filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_POSTS_PER_WINDOW) {
    const oldest = arr[0]!;
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    return { allowed: false, retryAfterSec };
  }
  arr.push(now);
  hits.set(ip, arr);
  prune(now);
  return { allowed: true };
}
