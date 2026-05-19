import { KrishnaApraLogo, type KrishnaApraLogoSize } from "@/components/krishna-apra-logo";
import { cn } from "@/lib/cn";

type Props = {
  size?: KrishnaApraLogoSize;
  labelPosition?: "above" | "below";
  align?: "center" | "start"; 
  className?: string;
  labelClassName?: string;
  priority?: boolean;
};

const LABEL_SIZE: Record<KrishnaApraLogoSize, string> = {
  sm: "text-[9px] sm:text-[10px]",
  md: "text-[9px] sm:text-[10px]",
  lg: "text-[9px] sm:text-[10px]",
  xl: "text-[10px] sm:text-xs",
};

export function TitleSponsorMark({
  size = "sm",
  labelPosition = "above",
  align = "center",
  className,
  labelClassName,
  priority = false,
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
      Title sponsor
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
      <KrishnaApraLogo size={size} priority={priority} />
      {labelPosition === "below" ? label : null}
    </div>
  );
}
