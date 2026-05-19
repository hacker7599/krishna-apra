import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "League desk",
    template: "%s · Future Star Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/40 font-[family-name:var(--font-dm)] text-slate-800 antialiased">
      {children}
    </div>
  );
}
