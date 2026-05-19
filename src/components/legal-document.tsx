import Link from "next/link";
import { LEGAL_LAST_UPDATED, type LegalSection } from "@/lib/legal-content";
import { COPYRIGHT_HOLDER, LEGAL_ENTITY } from "@/lib/site-legal";
import { cn } from "@/lib/cn";

type Props = {
  summary: string;
  sections: LegalSection[];
  activeDoc: "privacy" | "terms";
};

function SectionBody({ section }: { section: LegalSection }) {
  return (
    <section id={section.id} className="scroll-mt-24 border-b border-slate-200 pb-8 last:border-b-0">
      <h2 className="font-[family-name:var(--font-barlow)] text-xl font-bold italic tracking-tight text-slate-900 sm:text-2xl">
        {section.title}
      </h2>
      {section.paragraphs?.map((p) => (
        <p key={p.slice(0, 48)} className="prose-league mt-4 text-sm font-medium leading-relaxed sm:text-[15px]">
          {p}
        </p>
      ))}
      {section.list && section.list.length > 0 ? (
        <ul className="mt-4 list-none space-y-2.5 pl-0">
          {section.list.map((item) => (
            <li key={item.slice(0, 48)} className="flex gap-3 text-sm font-medium leading-relaxed text-slate-700 sm:text-[15px]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {section.subsections?.map((sub) => (
        <div key={sub.title} className="mt-6 rounded-lg border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">{sub.title}</h3>
          {sub.paragraphs?.map((p) => (
            <p key={p.slice(0, 48)} className="prose-league mt-3 text-sm font-medium leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function LegalDocument({ summary, sections, activeDoc }: Props) {
  const other = activeDoc === "privacy" ? { href: "/terms", label: "Terms & conditions" } : { href: "/privacy", label: "Privacy policy" };

  return (
    <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,220px)_1fr] lg:gap-12 xl:gap-16">
      <aside className="mb-8 lg:mb-0 lg:sticky lg:top-24 lg:self-start">
        <nav aria-label="On this page" className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <p className="eyebrow text-orange-700">On this page</p>
          <ol className="mt-3 max-h-[min(70vh,28rem)] space-y-1 overflow-y-auto text-sm font-semibold text-slate-700">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-md px-2 py-1.5 transition hover:bg-white hover:text-orange-700">
                  {s.title.replace(/^\d+\.\s*/, "")}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-4 hidden rounded-xl border border-slate-200 bg-white p-4 text-xs font-medium text-slate-600 shadow-sm lg:block">
          <p className="font-bold text-slate-900">Related</p>
          <Link href={other.href} className="mt-2 block text-orange-700 hover:underline">
            {other.label}
          </Link>
          <Link href="/contact" className="mt-2 block text-orange-700 hover:underline">
            Contact us
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="rounded-xl border border-orange-200/80 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-800">Summary</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-800 sm:text-[15px]">{summary}</p>
          <p className="mt-4 text-xs font-semibold text-slate-500">Last updated: {LEGAL_LAST_UPDATED}</p>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm sm:p-6">
          <p className="font-bold text-slate-900">{LEGAL_ENTITY.legalName}</p>
          <p className="mt-1 text-slate-600">{LEGAL_ENTITY.tradeName}</p>
          <dl className="mt-4 grid gap-2 text-xs font-medium text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="font-bold uppercase tracking-wide text-slate-500">Email</dt>
              <dd className="mt-0.5">
                <a href={`mailto:${LEGAL_ENTITY.contactEmail}`} className="text-orange-700 hover:underline">
                  {LEGAL_ENTITY.contactEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-bold uppercase tracking-wide text-slate-500">Grievance</dt>
              <dd className="mt-0.5">
                <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`} className="text-orange-700 hover:underline">
                  {LEGAL_ENTITY.grievanceEmail}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <article className={cn("mt-10 space-y-8")}>
          {sections.map((section) => (
            <SectionBody key={section.id} section={section} />
          ))}
        </article>

        <footer className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-xs font-medium text-slate-500">
            © {new Date().getFullYear()} {COPYRIGHT_HOLDER}. All rights reserved. This document is provided for general information and does not
            constitute legal advice. Please consult qualified counsel for organisation-specific compliance.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <Link href={other.href} className="text-orange-700 hover:underline">
              {other.label}
            </Link>
            <Link href="/contact" className="text-orange-700 hover:underline">
              Contact
            </Link>
            <Link href="/register" className="text-slate-700 hover:text-slate-900">
              Trial registration
            </Link>
            <Link href="/" className="text-slate-700 hover:text-slate-900">
              Home
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
