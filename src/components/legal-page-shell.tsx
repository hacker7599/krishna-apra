import { SiteInnerHero } from "@/components/site/site-inner-hero";
import { SiteSection } from "@/components/site-section";
import { LEGAL_ENTITY } from "@/lib/site-legal";

type Props = {
  title: string;
  lead?: string;
  children: React.ReactNode;
};

export function LegalPageShell({ title, lead, children }: Props) {
  return (
    <div className="page-legal">
      <SiteInnerHero
        title={title}
        lead={lead ?? `${LEGAL_ENTITY.tradeName} · operated by ${LEGAL_ENTITY.legalName}`}
        breadcrumb={[{ label: title }]}
      />
      <SiteSection width="wide" tone="white" innerClassName="page-legal__body">
        <div className="page-legal__content">{children}</div>
      </SiteSection>
    </div>
  );
}
