import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostContent } from "@/components/blog-post-content";
import { SiteInnerHero } from "@/components/site/site-inner-hero";
import { SiteSection } from "@/components/site-section";
import { buildBlogPostMetadata, blogPostJsonLd } from "@/lib/blog-seo";
import { getPublishedBlogPostBySlug } from "@/lib/blog-queries";
import { plainTextFromBlogContent } from "@/lib/blog-content-utils";
import { BTN_SECONDARY } from "@/lib/site-ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return buildBlogPostMetadata(post);
}

function formatDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function readingMinutes(content: string) {
  const words = plainTextFromBlogContent(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = blogPostJsonLd(post);
  const dateLabel = formatDate(post.publishedAt);
  const metaParts = [dateLabel, `${readingMinutes(post.content)} min read`].filter(Boolean).join(" · ");

  return (
    <div className="page-blog-post">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteInnerHero
        eyebrow={metaParts || "Article"}
        title={post.title}
        lead={post.excerpt ?? undefined}
        breadcrumb={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
      />
      <SiteSection width="narrow" tone="white" innerClassName="page-blog-post__body">
        {post.authorName ? <p className="blog-post__byline">By {post.authorName}</p> : null}

        {post.coverImageUrl ? (
          <div className="blog-post__cover">
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 48rem) 100vw, 48rem"
              unoptimized={post.coverImageUrl.startsWith("/api/")}
            />
          </div>
        ) : null}

        <div className="blog-post__content">
          <BlogPostContent content={post.content} />
        </div>

        <div className="blog-post__footer">
          <Link href="/blog" className={BTN_SECONDARY}>
            ← All articles
          </Link>
          <Link href="/register" className={BTN_SECONDARY}>
            Join trial
          </Link>
        </div>
      </SiteSection>
    </div>
  );
}
