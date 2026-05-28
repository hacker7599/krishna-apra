import { REGISTRATION_SUPPORT_EMAIL, REGISTRATION_SUPPORT_PHONE } from "@/lib/league";

type Props = {
  className?: string;
  linkClassName?: string;
};

/** Phone and support email as inline links (separated by ·). */
export function SupportContactLinks({ className, linkClassName = "font-bold text-orange-700 hover:text-orange-800" }: Props) {
  return (
    <span className={className}>
      <a href={`tel:${REGISTRATION_SUPPORT_PHONE}`} className={linkClassName}>
        {REGISTRATION_SUPPORT_PHONE}
      </a>
      <span className="text-slate-500"> · </span>
      <a href={`mailto:${REGISTRATION_SUPPORT_EMAIL}`} className={linkClassName}>
        {REGISTRATION_SUPPORT_EMAIL}
      </a>
    </span>
  );
}
