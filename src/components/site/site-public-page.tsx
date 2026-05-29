import { SiteInnerHero } from "@/components/site/site-inner-hero";
import { SiteSection } from "@/components/site-section";
import { cn } from "@/lib/cn";

type BreadcrumbItem = { label: string; href?: string };

type Props = {
  title: string;
  lead?: string;
  eyebrow?: string;
  breadcrumb?: BreadcrumbItem[];
  heroChildren?: React.ReactNode;
  width?: "content" | "narrow" | "wide";
  pageClassName?: string;
  bodyClassName?: string;
  children: React.ReactNode;
};

/** Standard public page: navy inner hero + white content section. */
export function SitePublicPage({
  title,
  lead,
  eyebrow,
  breadcrumb,
  heroChildren,
  width = "content",
  pageClassName,
  bodyClassName,
  children,
}: Props) {
  return (
    <div className={cn("site-public-page", pageClassName)}>
      <SiteInnerHero title={title} lead={lead} eyebrow={eyebrow} breadcrumb={breadcrumb}>
        {heroChildren}
      </SiteInnerHero>
      <SiteSection width={width} tone="white" innerClassName={cn("site-public-page__body", bodyClassName)}>
        {children}
      </SiteSection>
    </div>
  );
}
