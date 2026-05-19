import { KRISHNA_APRA_LOGO_SRC } from "@/lib/branding";
import { cn } from "@/lib/cn";

export type KrishnaApraLogoSize = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<KrishnaApraLogoSize, { heightClass: string; width: number; height: number }> = {
  sm: { heightClass: "h-9", width: 120, height: 48 },
  md: { heightClass: "h-11 sm:h-12", width: 160, height: 64 },
  lg: { heightClass: "h-14 sm:h-16", width: 220, height: 88 },
  xl: { heightClass: "h-16 sm:h-[4.5rem] md:h-20", width: 280, height: 112 },
};

type Props = {
  className?: string;
  size?: KrishnaApraLogoSize;
  priority?: boolean;
};

/** Transparent Krishna Apra mark — plain img avoids next/image hydration mismatches. */
export function KrishnaApraLogo({ className, size = "sm", priority = false }: Props) {
  const preset = SIZE_MAP[size];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={KRISHNA_APRA_LOGO_SRC}
      alt="Krishna Apra"
      width={preset.width}
      height={preset.height}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={cn("block w-auto object-contain object-center", preset.heightClass, className)}
    />
  );
}
