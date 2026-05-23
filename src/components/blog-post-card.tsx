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
    <li className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <Link href={href} className="block">
        {post.coverImageUrl ? (
          <div className="relative aspect-[16/9] w-full bg-slate-100">
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
          <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[#1B365D] to-slate-800">
            <span className="font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-white/90">Future Star</span>
          </div>
        )}
        <div className="p-5">
          {date ? <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700">{date}</p> : null}
          <h2 className="mt-1 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-slate-900 group-hover:text-orange-800">
            {post.title}
          </h2>
          {post.excerpt ? <p className="prose-league mt-2 line-clamp-3 text-sm font-medium">{post.excerpt}</p> : null}
          {post.authorName ? <p className="mt-3 text-xs font-semibold text-slate-500">By {post.authorName}</p> : null}
          <span className="mt-4 inline-block text-sm font-bold text-[#1B365D] group-hover:text-orange-700">Read article →</span>
        </div>
      </Link>
    </li>
  );
}
