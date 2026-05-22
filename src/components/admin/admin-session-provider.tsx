"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { adminFetch, loadAdminSession, setAdminCsrf } from "@/lib/admin-client";

type Session = { username: string; csrfToken: string } | null;

const AdminSessionContext = createContext<{
  session: Session;
  ready: boolean;
  refresh: () => Promise<void>;
}>({ session: null, ready: false, refresh: async () => {} });

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [ready, setReady] = useState(false);

  const refresh = async () => {
    const s = await loadAdminSession();
    setSession(s);
    if (!s) setAdminCsrf(null);
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const s = await loadAdminSession();
      if (!cancelled) {
        setSession(s);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminSessionContext.Provider value={{ session, ready, refresh }}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  return useContext(AdminSessionContext);
}

export { adminFetch };
