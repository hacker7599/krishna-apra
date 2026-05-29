import Image from "next/image";
import Link from "next/link";
import type { PublicBlogPost } from "@/lib/blog-queries";
import { blogPostPagePath } from "@/lib/blog-seo";

function formatDate(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

type Props = {
  post: Pick<PublicBlogPost, "slug" | "title" | "excerpt" | "coverImageUrl" | "authorName" | "publishedAt">;
};

export function BlogPostCard({ post }: Props) {
  const href = blogPostPagePath(post.slug);
  const date = formatDate(post.publishedAt);

  return (
    <li className="blog-card group">
      <Link href={href} className="blog-card__link">
        {post.coverImageUrl ? (
          <div className="blog-card__media">
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              className="object-cover transition group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={post.coverImageUrl.startsWith("/api/")}
            />
          </div>
        ) : (
          <div className="blog-card__media blog-card__media--placeholder">
            <span className="blog-card__placeholder-text">Future Star</span>
          </div>
        )}
        <div className="blog-card__body">
          {date ? <p className="blog-card__date">{date}</p> : null}
          <h2 className="blog-card__title">{post.title}</h2>
          {post.excerpt ? <p className="blog-card__excerpt">{post.excerpt}</p> : null}
          {post.authorName ? <p className="blog-card__author">By {post.authorName}</p> : null}
          <span className="blog-card__read">Read article →</span>
        </div>
      </Link>
    </li>
  );
}
