import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

/** Logos on printable forms/receipts — unoptimized so print CSS and PDF output stay stable. */
export function PrintLayoutImage({ src, alt, width, height, className }: Props) {
  return <Image src={src} alt={alt} width={width} height={height} className={className} unoptimized />;
}
