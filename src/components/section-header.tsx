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
    <header className={cn(align === "center" && "mx-auto max-w-3xl text-center", className)}>
      {eyebrow ? <p className={EYEBROW}>{eyebrow}</p> : null}
      <h2 className={cn("mt-3", SECTION_TITLE)}>{title}</h2>
      {lead ? <p className={cn(PAGE_LEAD, align === "center" && "mx-auto")}>{lead}</p> : null}
    </header>
  );
}
