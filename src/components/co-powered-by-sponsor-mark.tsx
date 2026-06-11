import { TENXU_LOGO_SRC } from "@/lib/branding";
import { cn } from "@/lib/cn";
import { CO_POWERED_BY_SPONSOR } from "@/lib/league";

type Size = "sm" | "md" | "lg";

const LABEL_SIZE: Record<Size, string> = {
  sm: "text-[9px] sm:text-[10px]",
  md: "text-[9px] sm:text-[10px]",
  lg: "text-[10px] sm:text-xs",
};

const NAME_SIZE: Record<Size, string> = {
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-3xl",
  lg: "text-3xl sm:text-4xl",
};

const LOGO_HEIGHT: Record<Size, string> = {
  sm: "h-9",
  md: "h-11 sm:h-12",
  lg: "h-14 sm:h-16",
};

type Props = {
  size?: Size;
  labelPosition?: "above" | "below";
  align?: "center" | "start";
  className?: string;
  labelClassName?: string;
};

export function CoPoweredBySponsorMark({
  size = "sm",
  labelPosition = "above",
  align = "center",
  className,
  labelClassName,
}: Props) {
  const label = (
    <span
      className={cn(
        "block font-bold uppercase tracking-[0.18em] text-slate-500",
        LABEL_SIZE[size],
        align === "start" ? "text-left" : "text-center",
        labelClassName,
      )}
    >
      Co powered by
    </span>
  );

  const mark = TENXU_LOGO_SRC ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={TENXU_LOGO_SRC}
      alt={CO_POWERED_BY_SPONSOR}
      decoding="async"
      loading="lazy"
      className={cn("block w-auto max-w-full object-contain object-center", LOGO_HEIGHT[size])}
    />
  ) : (
    <span
      className={cn(
        "font-[family-name:var(--font-bebas)] uppercase tracking-[0.08em] text-slate-900",
        NAME_SIZE[size],
        align === "start" ? "text-left" : "text-center",
      )}
    >
      {CO_POWERED_BY_SPONSOR}
    </span>
  );

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-0.5",
        align === "start" ? "items-start" : "items-center",
        className,
      )}
    >
      {labelPosition === "above" ? label : null}
      {mark}
      {labelPosition === "below" ? label : null}
    </div>
  );
}
