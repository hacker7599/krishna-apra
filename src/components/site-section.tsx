import { cn } from "@/lib/cn";
import {
  SECTION,
  SECTION_ACCENT,
  SECTION_MUTED,
  SECTION_WHITE,
  SITE_CONTAINER,
  SITE_CONTAINER_CONTENT,
  SITE_CONTAINER_NARROW,
} from "@/lib/site-ui";

type Width = "wide" | "content" | "narrow";
type Tone = "white" | "muted" | "accent" | "transparent";

const widthClass: Record<Width, string> = {
  wide: SITE_CONTAINER,
  content: SITE_CONTAINER_CONTENT,
  narrow: SITE_CONTAINER_NARROW,
};

const toneClass: Record<Tone, string> = {
  white: SECTION_WHITE,
  muted: SECTION_MUTED,
  accent: SECTION_ACCENT,
  transparent: `${SECTION} bg-transparent`,
};

type Props = {
  children: React.ReactNode;
  width?: Width;
  tone?: Tone;
  className?: string;
  innerClassName?: string;
  id?: string;
  noBorder?: boolean;
};

export function SiteSection({
  children,
  width = "content",
  tone = "transparent",
  className = "",
  innerClassName = "",
  id,
  noBorder = false,
}: Props) {
  return (
    <section id={id} className={cn(toneClass[tone], noBorder && "border-b-0", className)}>
      <div className={cn(widthClass[width], innerClassName)}>{children}</div>
    </section>
  );
}
