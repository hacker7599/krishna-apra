import type { Metadata } from "next";
import { BlogPostCard } from "@/components/blog-post-card";
import { SitePublicPage } from "@/components/site/site-public-page";
import { blogListingMetadata } from "@/lib/blog-seo";
import { countPublishedBlogPosts, getPublishedBlogPosts } from "@/lib/blog-queries";
import { EMPTY_STATE } from "@/lib/site-ui";
import { REGION } from "@/lib/league";

export const dynamic = "force-dynamic";

export const metadata: Metadata = blogListingMetadata();

const PAGE_SIZE = 12;

export default async function BlogPage() {
  const [posts, total] = await Promise.all([getPublishedBlogPosts(PAGE_SIZE, 0), countPublishedBlogPosts()]);

  return (
    <SitePublicPage
      pageClassName="page-blog"
      eyebrow={REGION}
      title="News & updates"
      lead="Trial announcements, league stories, and highlights from Future Star U-15 in Delhi NCR."
      breadcrumb={[{ label: "Blog" }]}
    >
      {posts.length === 0 ? (
        <div className={`${EMPTY_STATE} site-empty--large`}>
          <p>No articles published yet.</p>
          <p className="mt-2 text-sm font-medium text-slate-500">League news and trial updates will appear here when published from the admin blog.</p>
        </div>
      ) : (
        <>
          <ul className="blog-grid">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </ul>
          {total > PAGE_SIZE ? (
            <p className="blog-grid__more">Showing latest {PAGE_SIZE} of {total} articles.</p>
          ) : null}
        </>
      )}
    </SitePublicPage>
  );
}
