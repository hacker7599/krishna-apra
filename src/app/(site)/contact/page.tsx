import type { Metadata } from "next";
import Link from "next/link";
import { SitePublicPage } from "@/components/site/site-public-page";
import { BTN_PRIMARY } from "@/lib/site-ui";
import { LEGAL_ENTITY } from "@/lib/site-legal";
import { LEAGUE_NAME, REGISTRATION_SUPPORT_PHONES, REGION, VENUE } from "@/lib/league";

export const metadata: Metadata = {
  title: `Contact us · ${LEAGUE_NAME}`,
  description: "Contact Future Star U-15 Championship — registrations, partnerships, and grievances.",
};

export default function ContactPage() {
  return (
    <SitePublicPage
      pageClassName="page-contact"
      eyebrow={REGION}
      title="Contact us"
      lead="Trial registrations, partnerships, media, and general enquiries for the Future Star U-15 Championship."
      breadcrumb={[{ label: "Contact" }]}
      width="narrow"
    >
      <p className="page-contact__intro">For trial registrations, partnerships, media, and general enquiries about {LEGAL_ENTITY.tradeName}, reach us below.</p>

      <div className="contact-panel">
        <dl className="contact-panel__list">
          <div className="contact-panel__row">
            <dt className="contact-panel__label">Registration desk (phone)</dt>
            <dd className="contact-panel__value">
              {REGISTRATION_SUPPORT_PHONES.map((phone) => (
                <a key={phone} href={`tel:${phone}`} className="contact-panel__link">
                  {phone}
                </a>
              ))}
            </dd>
          </div>
          <div className="contact-panel__row">
            <dt className="contact-panel__label">General enquiries</dt>
            <dd className="contact-panel__value">
              <a href={`mailto:${LEGAL_ENTITY.contactEmail}`} className="contact-panel__link">
                {LEGAL_ENTITY.contactEmail}
              </a>
            </dd>
          </div>
          <div className="contact-panel__row">
            <dt className="contact-panel__label">Grievance officer</dt>
            <dd className="contact-panel__value">
              <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`} className="contact-panel__link">
                {LEGAL_ENTITY.grievanceEmail}
              </a>
            </dd>
          </div>
          <div className="contact-panel__row">
            <dt className="contact-panel__label">Registered entity</dt>
            <dd className="contact-panel__value">{LEGAL_ENTITY.legalName}</dd>
            <dd className="contact-panel__sub">{LEGAL_ENTITY.registeredAddress}</dd>
          </div>
        </dl>
      </div>

      <h2 className="page-contact__heading">Primary venue</h2>
      <p className="page-contact__venue">{VENUE}</p>

      <div className="page-contact__cta">
        <Link href="/register" className={BTN_PRIMARY}>
          Online trial registration
        </Link>
      </div>
    </SitePublicPage>
  );
}
