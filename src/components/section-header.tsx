import { cn } from "@/lib/cn";
import { EYEBROW, PAGE_LEAD, SECTION_TITLE } from "@/lib/site-ui";

type Props = {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({ eyebrow, title, lead, align = "left", className }: Props) {
  return (
    <header
      className={cn(
        "site-section-header",
        align === "center" && "site-section-header--center mx-auto max-w-3xl text-center",
        className,
      )}
    >
      {eyebrow ? <p className={EYEBROW}>{eyebrow}</p> : null}
      <h2 className={cn("mt-3", SECTION_TITLE)}>{title}</h2>
      <div className="site-section-header__rule" aria-hidden />
      {lead ? <p className={cn(PAGE_LEAD, "mt-4", align === "center" && "mx-auto")}>{lead}</p> : null}
    </header>
  );
}
