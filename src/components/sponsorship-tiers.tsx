import type { SponsorshipTier } from "@/lib/sponsorship-tiers";
import { SPONSORSHIP_TIERS } from "@/lib/sponsorship-tiers";

function TierCard({ tier }: { tier: SponsorshipTier }) {
  return (
    <article
      id={tier.id}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.06] shadow-xl backdrop-blur-sm"
    >
      <div className="border-b border-white/15 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-sm bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm">
              Season 1
            </p>
            <h2 className="font-[family-name:var(--font-bebas)] text-4xl uppercase tracking-[0.06em] sm:text-5xl">
              <span className="text-amber-300">{tier.headlineAmber}</span>
              <span className="text-white"> {tier.headlineWhite}</span>
            </h2>
          </div>
          <p className="shrink-0 self-start rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white shadow-md sm:self-center">
            {tier.price}
          </p>
        </div>
      </div>

      <div className="grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
        {tier.columns.map((col) => (
          <div key={col.title} className="p-5 sm:p-6">
            <h3 className="rounded-lg border border-white/35 px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-0" role="list">
              {col.rows.map((row) => (
                <li
                  key={row.label}
                  className="flex gap-3 border-b border-white/[0.08] py-2.5 text-sm last:border-b-0"
                >
                  <span className="min-w-0 flex-1 font-medium leading-snug text-white/90">{row.label}</span>
                  {row.value != null && row.value !== "" ? (
                    <span className="shrink-0 text-right font-bold tabular-nums text-amber-200">{row.value}</span>
                  ) : (
                    <span className="shrink-0 font-bold text-emerald-300/95" title="Included">
                      <span className="sr-only">Included</span>
                      <span aria-hidden>✓</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}

type Props = {
  tiers?: SponsorshipTier[];
};

export function SponsorshipTiers({ tiers = SPONSORSHIP_TIERS }: Props) {
  return (
    <div className="space-y-10 sm:space-y-12">
      {tiers.map((tier) => (
        <TierCard key={tier.id} tier={tier} />
      ))}
    </div>
  );
}
