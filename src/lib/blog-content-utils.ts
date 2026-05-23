/** True when content was saved from the rich-text editor (HTML), not legacy Markdown. */
export function isBlogHtmlContent(content: string): boolean {
  const t = content.trim();
  if (!t.startsWith("<")) return false;
  return /<(p|h[1-6]|ul|ol|blockquote|div|strong|em)\b/i.test(t);
}

export function isEmptyEditorHtml(html: string): boolean {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").trim();
  return text.length === 0;
}

export function plainTextFromBlogContent(content: string): string {
  if (isBlogHtmlContent(content)) {
    return content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  return content.replace(/[#*_\[\]()>`]/g, " ").replace(/\s+/g, " ").trim();
}
