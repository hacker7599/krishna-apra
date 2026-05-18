import { LEAGUE_PROTECTION_BLOCKS } from "@/lib/league-protection";

type Props = {
  /** Tighter spacing when embedded on the homepage. */
  compact?: boolean;
};

export function LeagueProtectionSection({ compact = false }: Props) {
  const py = compact ? "py-12 sm:py-14" : "py-14 sm:py-20";
  const gap = compact ? "gap-6" : "gap-8";

  return (
    <section
      id="league-protection"
      className={`relative overflow-hidden border-b border-violet-950/30 bg-gradient-to-br from-violet-950 via-violet-900 to-violet-950 ${py}`}
      aria-labelledby="league-protection-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath fill='%23ffffff' d='M40 0L80 40L40 80L0 40z'/%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-4 top-0 hidden h-full w-10 skew-x-[-14deg] bg-amber-400/90 shadow-lg sm:block md:-left-6 md:w-12" aria-hidden />
      <div className="pointer-events-none absolute -right-4 top-0 hidden h-full w-10 skew-x-[14deg] bg-amber-400/90 shadow-lg sm:block md:-right-6 md:w-12" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className={`mb-10 text-center ${compact ? "sm:mb-10" : "sm:mb-12"}`}>
          <p className="mb-4 inline-flex rounded-sm bg-amber-400 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-950 shadow-sm">
            Season 1
          </p>
          <h2 id="league-protection-heading">
            <span className="font-[family-name:var(--font-bebas)] text-4xl uppercase tracking-[0.08em] text-amber-400 sm:text-5xl md:text-6xl">League</span>
            <span className="ml-2 font-[family-name:var(--font-bebas)] text-4xl uppercase tracking-[0.08em] text-white sm:text-5xl md:text-6xl">protection</span>
          </h2>
        </div>

        <ul className={`grid ${gap} md:grid-cols-3`}>
          {LEAGUE_PROTECTION_BLOCKS.map((block) => (
            <li
              key={block.title}
              className="flex flex-col rounded-2xl border border-white/25 bg-white/[0.06] p-5 shadow-lg backdrop-blur-sm sm:p-6"
            >
              <h3 className="rounded-lg border border-white/40 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-white">
                {block.title}
              </h3>
              <p className="mt-4 text-center text-sm font-medium leading-relaxed text-white/90">{block.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
