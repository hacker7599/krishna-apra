import { TricolorBar } from "@/components/graphics/tricolor-bar";
import { SiteBreadcrumb } from "@/components/site-breadcrumb";
import { PAGE_LEAD, PAGE_TITLE } from "@/lib/site-ui";

type BreadcrumbItem = { label: string; href?: string };

type Props = {
  title: string;
  lead?: string;
  children?: React.ReactNode;
  className?: string;
  breadcrumb?: BreadcrumbItem[];
};

export function SitePageHero({ title, lead, children, className = "", breadcrumb }: Props) {
  return (
    <div className={className}>
      {breadcrumb && breadcrumb.length > 0 ? <SiteBreadcrumb items={breadcrumb} /> : null}
      <TricolorBar className="max-w-36 rounded-sm" />
      <h1 className={`mt-6 ${PAGE_TITLE}`}>{title}</h1>
      {lead ? <p className={PAGE_LEAD}>{lead}</p> : null}
      {children}
    </div>
  );
}
