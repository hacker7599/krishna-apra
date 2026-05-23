import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/app-url";
import { getPublishedBlogSlugs } from "@/lib/blog-queries";

const staticPaths = [
  "",
  "/about",
  "/teams",
  "/trials",
  "/register",
  "/contact",
  "/sponsorship",
  "/blog",
  "/terms",
  "/privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppBaseUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/blog" ? 0.8 : 0.6,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedBlogSlugs();
    blogEntries = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    /* DB may be unavailable at build time */
  }

  return [...staticEntries, ...blogEntries];
}
