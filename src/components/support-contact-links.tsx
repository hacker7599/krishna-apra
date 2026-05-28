import { REGISTRATION_SUPPORT_EMAIL, REGISTRATION_SUPPORT_PHONES } from "@/lib/league";

type Props = {
  className?: string;
  linkClassName?: string;
};

/** Support phones and email as inline links (separated by ·). */
export function SupportContactLinks({ className, linkClassName = "font-bold text-orange-700 hover:text-orange-800" }: Props) {
  return (
    <span className={className}>
      {REGISTRATION_SUPPORT_PHONES.map((phone, i) => (
        <span key={phone}>
          {i > 0 ? <span className="text-slate-500"> · </span> : null}
          <a href={`tel:${phone}`} className={linkClassName}>
            {phone}
          </a>
        </span>
      ))}
      <span className="text-slate-500"> · </span>
      <a href={`mailto:${REGISTRATION_SUPPORT_EMAIL}`} className={linkClassName}>
        {REGISTRATION_SUPPORT_EMAIL}
      </a>
    </span>
  );
}
