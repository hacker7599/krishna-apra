import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  src?: string;
  alt: string;
  label: string;
  /** Shown when empty — e.g. `/home/odw/priyansh.jpg` */
  suggestedPath?: string;
  aspectClassName?: string;
  className?: string;
  sizes?: string;
  imageClassName?: string;
};

/**
 * Always renders a visible frame. Empty `src` shows a dashed placeholder (never hidden).
 */
export function MediaSlot({
  src,
  alt,
  label,
  suggestedPath,
  aspectClassName = "aspect-[4/5]",
  className,
  sizes = "400px",
  imageClassName = "object-cover object-top",
}: Props) {
  const hasImage = Boolean(src?.trim());

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl",
        aspectClassName,
        hasImage ? "border border-slate-200 bg-slate-100 shadow-sm" : "flex min-h-[12rem] flex-col items-center justify-center border-2 border-dashed border-orange-300/80 bg-orange-50/40 px-4 py-6 text-center",
        className,
      )}
    >
      {hasImage ? (
        <Image src={src!} alt={alt} fill className={imageClassName} sizes={sizes} />
      ) : (
        <>
          <p className="eyebrow text-orange-700">{label}</p>
          <p className="mt-2 text-sm font-bold text-slate-900">{alt}</p>
          {suggestedPath ? (
            <p className="mt-3 max-w-full break-all rounded-md bg-white/80 px-2 py-1 font-mono text-[10px] text-slate-600 ring-1 ring-slate-200">
              {suggestedPath}
            </p>
          ) : null}
          <p className="mt-2 text-xs font-medium text-slate-500">Photo slot — add image to display</p>
        </>
      )}
    </div>
  );
}
