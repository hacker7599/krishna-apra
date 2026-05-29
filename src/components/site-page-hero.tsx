import { TricolorBar } from "@/components/graphics/tricolor-bar";
import { SiteBreadcrumb } from "@/components/site-breadcrumb";
import { SiteInnerHero } from "@/components/site/site-inner-hero";
import { cn } from "@/lib/cn";
import { PAGE_LEAD, PAGE_TITLE } from "@/lib/site-ui";

type BreadcrumbItem = { label: string; href?: string };

type Props = {
  title: string;
  lead?: string;
  eyebrow?: string;
  children?: React.ReactNode;
  className?: string;
  breadcrumb?: BreadcrumbItem[];
  compact?: boolean;
  /** `light` = legacy white hero (registration flows). Default = premium navy band. */
  variant?: "light" | "premium";
};

export function SitePageHero({
  title,
  lead,
  eyebrow,
  children,
  className = "",
  breadcrumb,
  compact,
  variant = "premium",
}: Props) {
  if (variant === "premium") {
    return (
      <SiteInnerHero
        title={title}
        lead={lead}
        eyebrow={eyebrow}
        breadcrumb={breadcrumb}
        className={cn(compact && "site-inner-hero--compact", className)}
      >
        {children}
      </SiteInnerHero>
    );
  }

  return (
    <div className={cn("site-page-hero", compact && "site-page-hero--compact", className)}>
      {breadcrumb && breadcrumb.length > 0 ? <SiteBreadcrumb items={breadcrumb} /> : null}
      <TricolorBar className="max-w-36 rounded-sm" />
      {eyebrow ? <p className="eyebrow mt-4">{eyebrow}</p> : null}
      <h1 className={PAGE_TITLE}>{title}</h1>
      {lead ? <p className={PAGE_LEAD}>{lead}</p> : null}
      {children}
    </div>
  );
}
