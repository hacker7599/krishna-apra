import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostContent } from "@/components/blog-post-content";
import { SiteBreadcrumb } from "@/components/site-breadcrumb";
import { SiteSection } from "@/components/site-section";
import { buildBlogPostMetadata, blogPostJsonLd } from "@/lib/blog-seo";
import { getPublishedBlogPostBySlug } from "@/lib/blog-queries";
import { plainTextFromBlogContent } from "@/lib/blog-content-utils";
import { BTN_SECONDARY } from "@/lib/site-ui";

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

  return (
    <SiteSection width="narrow" tone="white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteBreadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

      <article className="mt-8">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-orange-700">
          {dateLabel ? <span>{dateLabel}</span> : null}
          {dateLabel ? <span className="text-slate-300" aria-hidden>|</span> : null}
          <span>{readingMinutes(post.content)} min read</span>
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-slate-900 sm:text-5xl">{post.title}</h1>
        {post.authorName ? <p className="mt-2 text-sm font-semibold text-slate-600">By {post.authorName}</p> : null}
        {post.excerpt ? <p className="prose-league mt-4 text-lg font-medium text-slate-700">{post.excerpt}</p> : null}

        {post.coverImageUrl ? (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
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

        <div className="mt-10">
          <BlogPostContent content={post.content} />
        </div>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-slate-200 pt-8">
          <Link href="/blog" className={BTN_SECONDARY}>
            ← All articles
          </Link>
          <Link href="/register" className={BTN_SECONDARY}>
            Join trial
          </Link>
        </div>
      </article>
    </SiteSection>
  );
}

export async function generateStaticParams() {
  try {
    const { getPublishedBlogSlugs } = await import("@/lib/blog-queries");
    const rows = await getPublishedBlogSlugs();
    return rows.map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}
