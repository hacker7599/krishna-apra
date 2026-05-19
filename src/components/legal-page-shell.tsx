import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { LEGAL_ENTITY } from "@/lib/site-legal";

type Props = {
  title: string;
  lead?: string;
  children: React.ReactNode;
};

export function LegalPageShell({ title, lead, children }: Props) {
  return (
    <SiteSection width="wide" tone="white" innerClassName="!pb-16">
      <SitePageHero
        title={title}
        lead={lead ?? `${LEGAL_ENTITY.tradeName} · operated by ${LEGAL_ENTITY.legalName}`}
        breadcrumb={[{ label: title }]}
      />
      {children}
    </SiteSection>
  );
}
