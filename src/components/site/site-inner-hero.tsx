import { TricolorBar } from "@/components/graphics/tricolor-bar";
import { SiteBreadcrumb } from "@/components/site-breadcrumb";
import { cn } from "@/lib/cn";
import { SITE_CONTAINER } from "@/lib/site-ui";

type BreadcrumbItem = { label: string; href?: string };

type Props = {
  title: string;
  lead?: string;
  eyebrow?: string;
  breadcrumb?: BreadcrumbItem[];
  children?: React.ReactNode;
  className?: string;
};

/** Premium inner-page hero — navy band matching homepage carousel. */
export function SiteInnerHero({ title, lead, eyebrow, breadcrumb, children, className }: Props) {
  return (
    <div className={cn("site-inner-hero", className)}>
      <div className={`${SITE_CONTAINER} site-inner-hero__inner`}>
        {breadcrumb && breadcrumb.length > 0 ? (
          <SiteBreadcrumb items={breadcrumb} className="site-inner-hero__breadcrumb" />
        ) : null}
        <TricolorBar className="site-inner-hero__bar" />
        {eyebrow ? <p className="site-inner-hero__eyebrow">{eyebrow}</p> : null}
        <h1 className="site-inner-hero__title">{title}</h1>
        {lead ? <p className="site-inner-hero__lead">{lead}</p> : null}
        {children ? <div className="site-inner-hero__actions">{children}</div> : null}
      </div>
    </div>
  );
}
