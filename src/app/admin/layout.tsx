import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: {
    default: "League desk",
    template: "%s · Future Star Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
