import { ReceiptStandaloneChrome } from "@/components/receipt-standalone-chrome";

/** Receipt only — hides site nav/footer on screen and in print scope */
export default function RegisterReceiptLayout({ children }: { children: React.ReactNode }) {
  return <ReceiptStandaloneChrome>{children}</ReceiptStandaloneChrome>;
}
