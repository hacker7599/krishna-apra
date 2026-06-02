"use client";

import { useEffect, useState } from "react";

function formatCount(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function FooterVisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/site/visitor-count", {
      method: "POST",
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data: { count?: number }) => {
        if (cancelled) return;
        if (typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <p className="shrink-0 text-[11px] font-semibold tracking-wide text-slate-500">
      Visitors: {count === null ? "..." : formatCount(count)}
    </p>
  );
}
