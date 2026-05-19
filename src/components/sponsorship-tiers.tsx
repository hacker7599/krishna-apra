import type { SponsorshipTier } from "@/lib/sponsorship-tiers";
import { SPONSORSHIP_TIERS } from "@/lib/sponsorship-tiers";
import { CARD_PAD } from "@/lib/site-ui";

function TierCard({ tier }: { tier: SponsorshipTier }) {
  return (
    <article id={tier.id} className={`${CARD_PAD} overflow-hidden !p-0`}>
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-md bg-orange-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              Season 1
            </p>
            <h2 className="font-[family-name:var(--font-bebas)] text-4xl uppercase tracking-[0.06em] text-slate-900 sm:text-5xl">
              <span className="text-orange-600">{tier.headlineAmber}</span>
              <span> {tier.headlineWhite}</span>
            </h2>
          </div>
          <p className="shrink-0 self-start rounded-xl bg-orange-600 px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white sm:self-center">
            {tier.price}
          </p>
        </div>
      </div>

      <div className="grid divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
        {tier.columns.map((col) => (
          <div key={col.title} className="p-5 sm:p-6">
            <h3 className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-0" role="list">
              {col.rows.map((row) => (
                <li key={row.label} className="flex gap-3 border-b border-slate-100 py-2.5 text-sm last:border-b-0">
                  <span className="min-w-0 flex-1 font-medium leading-snug text-slate-700">{row.label}</span>
                  {row.value != null && row.value !== "" ? (
                    <span className="shrink-0 text-right font-bold tabular-nums text-orange-700">{row.value}</span>
                  ) : (
                    <span className="shrink-0 font-bold text-emerald-600" title="Included">
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
    <div className="space-y-8 sm:space-y-10">
      {tiers.map((tier) => (
        <TierCard key={tier.id} tier={tier} />
      ))}
    </div>
  );
}
