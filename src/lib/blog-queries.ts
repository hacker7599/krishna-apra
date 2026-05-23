import type { BlogPost } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PublicBlogPost = Pick<
  BlogPost,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "content"
  | "coverImageUrl"
  | "authorName"
  | "publishedAt"
  | "updatedAt"
  | "metaTitle"
  | "metaDescription"
  | "metaKeywords"
  | "ogImageUrl"
  | "canonicalUrl"
  | "robotsNoindex"
>;

const publicSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  coverImageUrl: true,
  authorName: true,
  publishedAt: true,
  updatedAt: true,
  metaTitle: true,
  metaDescription: true,
  metaKeywords: true,
  ogImageUrl: true,
  canonicalUrl: true,
  robotsNoindex: true,
} as const;

export function getPublishedBlogPosts(limit = 50, offset = 0) {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    skip: offset,
    select: publicSelect,
  });
}

export function countPublishedBlogPosts() {
  return prisma.blogPost.count({ where: { published: true } });
}

export function getPublishedBlogPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { published: true, slug },
    select: publicSelect,
  });
}

export function getPublishedBlogSlugs() {
  return prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}

export type BlogPostListItem = Pick<
  BlogPost,
  "id" | "slug" | "title" | "excerpt" | "coverImageUrl" | "authorName" | "publishedAt" | "published"
>;
