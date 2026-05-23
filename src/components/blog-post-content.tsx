import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isBlogHtmlContent } from "@/lib/blog-content-utils";
import { sanitizeBlogHtml } from "@/lib/sanitize-blog-html";

type Props = {
  content: string;
  className?: string;
};

export function BlogPostContent({ content, className = "" }: Props) {
  const wrap = `blog-prose prose-league ${className}`.trim();

  if (isBlogHtmlContent(content)) {
    const html = sanitizeBlogHtml(content);
    return <div className={wrap} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div className={wrap}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} className="font-semibold text-orange-700 underline-offset-2 hover:underline" rel="noopener noreferrer">
              {children}
            </a>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-slate-900 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => <h3 className="mt-8 text-lg font-bold text-[#1B365D]">{children}</h3>,
          ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-6">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="mt-6 border-l-4 border-orange-500 bg-orange-50/50 py-2 pl-4 italic text-slate-800">{children}</blockquote>
          ),
          img: ({ src, alt }) =>
            src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ""} className="mt-6 w-full rounded-xl border border-slate-200" loading="lazy" />
            ) : null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
