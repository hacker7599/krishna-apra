import sanitizeHtml from "sanitize-html";

const P_STYLE = "margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;";
const H2_STYLE = "margin:16px 0 10px;font-size:18px;font-weight:800;color:#0c1f3d;line-height:1.3;";
const H3_STYLE = "margin:14px 0 8px;font-size:16px;font-weight:700;color:#0c1f3d;line-height:1.35;";
const UL_STYLE = "margin:0 0 16px;padding-left:22px;font-size:15px;line-height:1.65;color:#334155;";
const OL_STYLE = UL_STYLE;
const LI_STYLE = "margin:0 0 6px;";
const BLOCKQUOTE_STYLE =
  "margin:16px 0;padding:12px 16px;border-left:4px solid #ea580c;background:#fff7ed;font-size:15px;line-height:1.6;color:#334155;";
const A_STYLE = "color:#ea580c;font-weight:700;text-decoration:underline;";

/** Sanitize admin-authored HTML and apply inline styles for email clients. */
export function sanitizeEmailBodyHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "h2", "h3", "ul", "ol", "li", "a", "blockquote"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      p: sanitizeHtml.simpleTransform("p", { style: P_STYLE }),
      h2: sanitizeHtml.simpleTransform("h2", { style: H2_STYLE }),
      h3: sanitizeHtml.simpleTransform("h3", { style: H3_STYLE }),
      ul: sanitizeHtml.simpleTransform("ul", { style: UL_STYLE }),
      ol: sanitizeHtml.simpleTransform("ol", { style: OL_STYLE }),
      li: sanitizeHtml.simpleTransform("li", { style: LI_STYLE }),
      blockquote: sanitizeHtml.simpleTransform("blockquote", { style: BLOCKQUOTE_STYLE }),
      a: sanitizeHtml.simpleTransform("a", {
        style: A_STYLE,
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}

export function emailBodyPlainText(html: string): string {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[23]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');

  return withBreaks
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function emailBodyTextLength(html: string): number {
  return emailBodyPlainText(html).length;
}
