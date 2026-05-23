import { formatImageUploadSpec, type ImageUploadSpecKey } from "@/lib/image-upload-specs";

export function ImageUploadSizeHint({
  specKey,
  className = "mt-1 text-xs font-medium leading-relaxed text-slate-500",
}: {
  specKey: ImageUploadSpecKey;
  className?: string;
}) {
  return <p className={className}>{formatImageUploadSpec(specKey)}</p>;
}
