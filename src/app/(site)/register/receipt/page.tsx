import type { Metadata } from "next";
import { RegistrationReceiptOnly } from "@/components/registration-receipt-only";

export const metadata: Metadata = {
  title: "Registration receipt",
  description: "Print your Future Star U-15 trial registration and payment confirmation.",
  robots: { index: false, follow: false },
};

export default function RegisterReceiptPage() {
  return <RegistrationReceiptOnly />;
}
