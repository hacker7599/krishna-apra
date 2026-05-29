import Link from "next/link";
import { SupportContactLinks } from "@/components/support-contact-links";
import { FORMAT, SEASON_START, TITLE_SPONSOR, TRIAL_FEE_INR } from "@/lib/league";

const QUICK_ACTIONS = [
  {
    href: "/register/status",
    label: "Check status",
    description: "Email + registration code",
    primary: true,
  },
  {
    href: "/register/offline",
    label: "Offline form",
    description: "Printable PDF",
  },
] as const;

export function RegisterPageInfoBar() {
  return (
    <div className="register-page-info-bar">
      <div className="register-page-info-bar__stats">
        <div className="register-page-info-bar__stat">
          <p className="register-page-info-bar__stat-label">Trials</p>
          <p className="register-page-info-bar__stat-value">{SEASON_START}</p>
        </div>
        <div className="register-page-info-bar__stat">
          <p className="register-page-info-bar__stat-label">Registration fee</p>
          <p className="register-page-info-bar__stat-value">₹{TRIAL_FEE_INR.toLocaleString("en-IN")}</p>
          <p className="register-page-info-bar__stat-note">Jersey included</p>
        </div>
        <div className="register-page-info-bar__stat">
          <p className="register-page-info-bar__stat-label">Format</p>
          <p className="register-page-info-bar__stat-value">
            {FORMAT.category} · {FORMAT.overs}-over
          </p>
        </div>
      </div>

      <div className="register-page-info-bar__actions" aria-label="Registration shortcuts">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`register-page-info-bar__action${"primary" in action && action.primary ? " register-page-info-bar__action--primary" : ""}`}
          >
            <span className="register-page-info-bar__action-label">{action.label}</span>
            <span className="register-page-info-bar__action-desc">{action.description}</span>
          </Link>
        ))}
      </div>

      <p className="register-page-info-bar__footer">
        <span className="font-semibold text-slate-700">{TITLE_SPONSOR}</span> — register only on this official site.{" "}
        <span className="text-slate-600">
          Help: <SupportContactLinks linkClassName="font-bold text-orange-700 underline underline-offset-2 hover:text-orange-800" />
        </span>
      </p>
    </div>
  );
}
