import type { Prisma } from "@prisma/client";
import { isBlogHtmlContent } from "@/lib/blog-content-utils";
import { sanitizeBlogHtml } from "@/lib/sanitize-blog-html";

/** Strip unsafe HTML before storing rich-text articles. */
export function normalizeBlogContentForStorage(content: string): string {
  if (isBlogHtmlContent(content)) {
    return sanitizeBlogHtml(content);
  }
  return content;
}

export function emptyToNull(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = s.trim();
  return t === "" ? null : t;
}

export function blogCreateData(
  data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImageUrl?: string | null;
    authorName: string;
    published: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
    ogImageUrl?: string | null;
    canonicalUrl?: string | null;
    robotsNoindex: boolean;
  },
  publishedAt: Date | null,
): Prisma.BlogPostCreateInput {
  return {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    coverImageUrl: emptyToNull(data.coverImageUrl ?? null),
    authorName: data.authorName,
    published: data.published,
    publishedAt,
    metaTitle: emptyToNull(data.metaTitle ?? null),
    metaDescription: emptyToNull(data.metaDescription ?? null),
    metaKeywords: emptyToNull(data.metaKeywords ?? null),
    ogImageUrl: emptyToNull(data.ogImageUrl ?? null),
    canonicalUrl: emptyToNull(data.canonicalUrl ?? null),
    robotsNoindex: data.robotsNoindex,
  };
}

export function resolvePublishedAt(
  currentPublished: boolean,
  nextPublished: boolean,
  currentPublishedAt: Date | null,
): Date | null {
  if (!nextPublished) return currentPublishedAt;
  if (nextPublished && !currentPublished) return new Date();
  return currentPublishedAt ?? new Date();
}
