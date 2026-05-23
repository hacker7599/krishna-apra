import type { Metadata } from "next";
import type { PublicBlogPost } from "@/lib/blog-queries";
import { getAppBaseUrl } from "@/lib/app-url";
import { LEAGUE_NAME } from "@/lib/league";

function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const base = getAppBaseUrl();
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

function resolveOgImage(post: PublicBlogPost): string | undefined {
  const raw = post.ogImageUrl?.trim() || post.coverImageUrl?.trim();
  if (!raw) return undefined;
  return absoluteUrl(raw);
}

export function blogPostPagePath(slug: string) {
  return `/blog/${slug}`;
}

export function buildBlogPostMetadata(post: PublicBlogPost): Metadata {
  const title = post.metaTitle?.trim() || post.title;
  const description =
    post.metaDescription?.trim() || post.excerpt.trim() || `${post.title} — ${LEAGUE_NAME} news and updates.`;
  const canonical = post.canonicalUrl?.trim()
    ? absoluteUrl(post.canonicalUrl.trim())
    : absoluteUrl(blogPostPagePath(post.slug));
  const ogImage = resolveOgImage(post);
  const keywords = post.metaKeywords?.trim()
    ? post.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;

  return {
    title: `${title} · ${LEAGUE_NAME}`,
    description,
    keywords,
    alternates: { canonical },
    robots: post.robotsNoindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: LEAGUE_NAME,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      ...(ogImage ? { images: [{ url: ogImage, alt: title }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export function blogListingMetadata(): Metadata {
  return {
    title: `News & updates · ${LEAGUE_NAME}`,
    description: `Latest news, trial updates, and stories from the ${LEAGUE_NAME} Under-15 cricket league in Delhi NCR.`,
    alternates: { canonical: absoluteUrl("/blog") },
    openGraph: {
      type: "website",
      title: `News & updates · ${LEAGUE_NAME}`,
      description: `Stories and announcements from ${LEAGUE_NAME}.`,
      url: absoluteUrl("/blog"),
    },
  };
}

export function blogPostJsonLd(post: PublicBlogPost) {
  const url = absoluteUrl(blogPostPagePath(post.slug));
  const image = resolveOgImage(post);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription?.trim() || post.excerpt || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: post.authorName
      ? { "@type": "Person", name: post.authorName }
      : { "@type": "Organization", name: LEAGUE_NAME },
    publisher: { "@type": "Organization", name: LEAGUE_NAME },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(image ? { image: [image] } : {}),
  };
}
