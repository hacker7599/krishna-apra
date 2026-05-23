import type { Metadata } from "next";
import { BlogPostCard } from "@/components/blog-post-card";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { blogListingMetadata } from "@/lib/blog-seo";
import { countPublishedBlogPosts, getPublishedBlogPosts } from "@/lib/blog-queries";
import { EMPTY_STATE } from "@/lib/site-ui";

/** Always read from the live database (not the empty list baked in at `next build`). */
export const dynamic = "force-dynamic";

export const metadata: Metadata = blogListingMetadata();

const PAGE_SIZE = 12;

export default async function BlogPage() {
  const [posts, total] = await Promise.all([getPublishedBlogPosts(PAGE_SIZE, 0), countPublishedBlogPosts()]);

  return (
    <SiteSection width="content" tone="white">
      <SitePageHero
        title="News & updates"
        lead="Trial announcements, league stories, and highlights from Future Star U-15 in Delhi NCR."
        breadcrumb={[{ label: "Blog" }]}
      />

      {posts.length === 0 ? (
        <div className={`mt-10 ${EMPTY_STATE} rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center`}>
          <p>No articles published yet.</p>
          <p className="mt-2 text-sm text-slate-500">League news and trial updates will appear here when published from the admin blog.</p>
        </div>
      ) : (
        <>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </ul>
          {total > PAGE_SIZE ? (
            <p className="mt-8 text-center text-sm font-medium text-slate-500">Showing latest {PAGE_SIZE} of {total} articles.</p>
          ) : null}
        </>
      )}
    </SiteSection>
  );
}
