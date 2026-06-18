import Link from "next/link";
import {
  isRegistrationOpen,
  REGISTRATION_CLOSED_CTA_LABEL,
} from "@/lib/registration-gate";
import { BTN_PRIMARY } from "@/lib/site-ui";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  openLabel?: string;
  closedLabel?: string;
};

export function RegisterCtaLink({
  className,
  openLabel = "Book trial slot",
  closedLabel = REGISTRATION_CLOSED_CTA_LABEL,
}: Props) {
  return (
    <Link href="/register" className={cn(BTN_PRIMARY, className)}>
      {isRegistrationOpen() ? openLabel : closedLabel}
    </Link>
  );
}
