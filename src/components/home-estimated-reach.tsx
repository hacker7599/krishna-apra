import Image from "next/image";
import { TricolorBar } from "@/components/graphics/tricolor-bar";
import { SectionHeader } from "@/components/section-header";
import {
  ESTIMATED_REACH_HEADLINE,
  ESTIMATED_REACH_HEADLINE_NOTE,
  ESTIMATED_REACH_METRICS,
  type ReachMetric,
} from "@/lib/estimated-reach";
import { LEAGUE_LOGO_SRC } from "@/lib/branding";
import { cn } from "@/lib/cn";
import { SITE_CONTAINER } from "@/lib/site-ui";

function ReachChannelIcon({ id, className }: { id: string; className?: string }) {
  const cls = cn("h-5 w-5", className);
  switch (id) {
    case "broadcast":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <rect x="3" y="6" width="18" height="11" rx="1.5" />
          <path strokeLinecap="round" d="M8 20h8" />
        </svg>
      );
    case "print-pr":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" d="M7 4h10v14a2 2 0 01-2 2H9a2 2 0 01-2-2V4z" />
          <path strokeLinecap="round" d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case "radio":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" d="M5 11v2a7 7 0 1014 0v-2" />
          <path strokeLinecap="round" d="M12 15v3M9 18h6" />
          <path strokeLinecap="round" d="M12 7a2.5 2.5 0 012.5 2.5" />
        </svg>
      );
    case "social":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="9" cy="9" r="3" />
          <path strokeLinecap="round" d="M12 11l8 6M4 15l5 4" />
        </svg>
      );
    case "spectators":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <ellipse cx="12" cy="15" rx="8" ry="3" />
          <path strokeLinecap="round" d="M4 15v1M20 15v1M12 7v3" />
        </svg>
      );
    case "non-traditional":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="6" cy="12" r="2" />
          <circle cx="12" cy="6" r="2" />
          <circle cx="18" cy="12" r="2" />
          <circle cx="12" cy="18" r="2" />
          <path strokeLinecap="round" d="M8 11l2-2M14 11l2-2M8 13l2 2M14 13l2 2" />
        </svg>
      );
    default:
      return null;
  }
}

function MetricValue({ metric }: { metric: ReachMetric }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-[family-name:var(--font-bebas)] text-4xl leading-none tracking-wide text-[#1B365D] xl:text-[2.75rem]">
        {metric.value}
      </span>
      {metric.unit ? (
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-600">{metric.unit}</span>
      ) : null}
    </div>
  );
}

function ReachCard({ metric, compact }: { metric: ReachMetric; compact?: boolean }) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        compact ? "gap-3" : "gap-4 p-5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700 ring-1 ring-orange-100">
          <ReachChannelIcon id={metric.id} />
        </div>
        <MetricValue metric={metric} />
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-900">{metric.label}</h3>
        {metric.sublabel ? <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-500">{metric.sublabel}</p> : null}
      </div>
    </article>
  );
}

function TimelineRail() {
  return (
    <div className="pointer-events-none absolute inset-x-6 top-1/2 z-0 hidden -translate-y-1/2 xl:block" aria-hidden>
      <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-slate-400" />
      <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-slate-400" />
    </div>
  );
}

function TimelineLabelBlock({ metric }: { metric: ReachMetric }) {
  return (
    <div className="mx-auto max-w-[10.5rem] text-center">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-700 ring-1 ring-orange-100">
        <ReachChannelIcon id={metric.id} />
      </div>
      <h3 className="mt-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-800">{metric.label}</h3>
      {metric.sublabel ? <p className="mt-1 text-[10px] font-medium leading-snug text-slate-500">{metric.sublabel}</p> : null}
    </div>
  );
}

function TimelineNode({ metric }: { metric: ReachMetric }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-full border-[3px] border-white bg-[#1B365D] shadow-lg ring-4 ring-slate-100">
        <span className="font-[family-name:var(--font-bebas)] text-2xl leading-none tracking-wide text-white">{metric.value}</span>
        {metric.unit ? (
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-orange-300">{metric.unit}</span>
        ) : null}
      </div>
    </div>
  );
}

function DesktopTimeline() {
  return (
    <div className="relative hidden xl:block px-2 pb-4">
      <TimelineRail />
      <ol className="relative z-10 grid grid-cols-6 gap-2">
        {ESTIMATED_REACH_METRICS.map((metric) => {
          const above = metric.position === "above";
          return (
            <li key={metric.id} className="grid min-h-[280px] grid-rows-[1fr_auto_1fr]">
              <div className={cn("flex items-end justify-center pb-5", !above && "invisible")}>
                {above ? <TimelineLabelBlock metric={metric} /> : null}
              </div>
              <div className="flex items-center justify-center py-3">
                <div className="flex flex-col items-center">
                  {above ? <div className="mb-2 h-6 w-px border-l border-dashed border-slate-300" aria-hidden /> : null}
                  <TimelineNode metric={metric} />
                  {!above ? <div className="mt-2 h-6 w-px border-l border-dashed border-slate-300" aria-hidden /> : null}
                </div>
              </div>
              <div className={cn("flex items-start justify-center pt-5", above && "invisible")}>
                {!above ? <TimelineLabelBlock metric={metric} /> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function HomeEstimatedReach() {
  return (
    <section className="site-section site-section--white border-b border-slate-200" aria-labelledby="home-estimated-reach-heading">
      <div className={SITE_CONTAINER}>
        <TricolorBar className="mx-auto max-w-24 rounded-sm sm:mx-0" />

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Media & exposure · Season 1"
            title="Estimated reach"
            lead="Projected audience and impression footprint across broadcast, print, radio, social, in-venue, and non-traditional channels for Future Star U-15."
            className="max-w-2xl"
          />
          <div className="flex shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <Image src={LEAGUE_LOGO_SRC} alt="Future Star U-15" width={56} height={56} className="h-11 w-11 rounded-md object-cover ring-1 ring-slate-200" />
          </div>
        </div>

        {/* Summary strip */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-xl bg-[#1B365D] px-6 py-5 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">Combined projection</p>
            <p id="home-estimated-reach-heading" className="mt-1 font-[family-name:var(--font-bebas)] text-5xl tracking-wide text-white sm:text-6xl">
              {ESTIMATED_REACH_HEADLINE}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-300">{ESTIMATED_REACH_HEADLINE_NOTE}</p>
          </div>
          <p className="max-w-md text-xs font-medium leading-relaxed text-slate-400">
            Figures are indicative reach estimates for Season 1 planning and partner discussions. Final audited numbers will be shared post-campaign.
          </p>
        </div>

        {/* Desktop zigzag timeline */}
        <div className="mt-12">
          <DesktopTimeline />
        </div>

        {/* Tablet: 3-column grid */}
        <ol className="mt-10 hidden gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 xl:hidden">
          {ESTIMATED_REACH_METRICS.map((metric) => (
            <li key={metric.id}>
              <ReachCard metric={metric} />
            </li>
          ))}
        </ol>

        {/* Mobile: horizontal scroll snap */}
        <ol className="mt-10 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
          {ESTIMATED_REACH_METRICS.map((metric) => (
            <li key={metric.id} className="w-[min(85vw,280px)] shrink-0 snap-center">
              <ReachCard metric={metric} compact />
            </li>
          ))}
        </ol>

        <p className="mt-8 text-center text-[11px] font-medium text-slate-400">
          Reach breakdown by channel · Future Star U-15 Season 1
        </p>
      </div>
    </section>
  );
}
