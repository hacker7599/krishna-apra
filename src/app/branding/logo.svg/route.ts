import { readFile } from "node:fs/promises";
import path from "node:path";

/** Public league logo as SVG (PNG embedded for crisp display at any size). */
export async function GET() {
  const pngPath = path.join(process.cwd(), "public/branding/logo.png");
  const png = await readFile(pngPath);
  const base64 = png.toString("base64");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" role="img" aria-label="Future Star U-15 Championship">
  <image width="512" height="512" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${base64}"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
