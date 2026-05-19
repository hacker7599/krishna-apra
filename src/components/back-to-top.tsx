"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 right-4 z-40 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 shadow-lg transition hover:border-orange-300 hover:text-orange-700 sm:bottom-6 print:hidden"
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}
