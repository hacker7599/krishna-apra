"use client";

const CSRF_KEY = "fs_admin_csrf";
const USER_KEY = "fs_admin_user";

let csrfToken: string | null = null;

export function setAdminCsrf(token: string | null) {
  csrfToken = token;
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem(CSRF_KEY, token);
  else sessionStorage.removeItem(CSRF_KEY);
}

export function getAdminCsrf() {
  return csrfToken;
}

function readCachedSession(): { username: string; csrfToken: string } | null {
  if (typeof window === "undefined") return null;
  const csrf = sessionStorage.getItem(CSRF_KEY);
  const username = sessionStorage.getItem(USER_KEY);
  if (!csrf || !username) return null;
  csrfToken = csrf;
  return { username, csrfToken: csrf };
}

export async function loadAdminSession(opts?: { background?: boolean }): Promise<{
  username: string;
  csrfToken: string;
} | null> {
  const cached = readCachedSession();
  if (cached && !opts?.background) {
    void fetch("/api/admin/session", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { username?: string; csrfToken?: string } | null) => {
        if (data?.csrfToken && data.username) {
          setAdminCsrf(data.csrfToken);
          sessionStorage.setItem(USER_KEY, data.username);
        }
      })
      .catch(() => undefined);
    return cached;
  }

  const res = await fetch("/api/admin/session", { credentials: "include" });
  if (!res.ok) {
    setAdminCsrf(null);
    if (typeof window !== "undefined") sessionStorage.removeItem(USER_KEY);
    return null;
  }
  const data = (await res.json()) as { username: string; csrfToken: string };
  setAdminCsrf(data.csrfToken);
  if (typeof window !== "undefined") sessionStorage.setItem(USER_KEY, data.username);
  return data;
}

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  if (!csrfToken && typeof window !== "undefined") {
    readCachedSession();
  }
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (method !== "GET" && method !== "HEAD" && csrfToken) {
    headers.set("X-Admin-CSRF", csrfToken);
  }
  const res = await fetch(input, { ...init, headers, credentials: "include" });
  if (res.status === 401 && typeof window !== "undefined") {
    sessionStorage.removeItem(CSRF_KEY);
    sessionStorage.removeItem(USER_KEY);
    window.location.href = "/admin/login";
  }
  return res;
}
