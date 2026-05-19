import Link from "next/link";

type Crumb = { label: string; href?: string };

export function SiteBreadcrumb({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
        <li>
          <Link href="/" className="transition hover:text-orange-700">
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            <span aria-hidden className="text-slate-300">
              /
            </span>
            {item.href ? (
              <Link href={item.href} className="transition hover:text-orange-700">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-800">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
