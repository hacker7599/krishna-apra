import { CoPoweredBySponsorMark } from "@/components/co-powered-by-sponsor-mark";
import { TitleSponsorMark } from "@/components/title-sponsor-mark";
import { CARD_PAD } from "@/lib/site-ui";

export function SponsorshipSeasonPartners() {
  return (
    <section className="page-sponsorship__partners" aria-labelledby="sponsorship-partners-heading">
      <div className={`${CARD_PAD} bg-white`}>
        <h2 id="sponsorship-partners-heading" className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Season 1 partners
        </h2>
        <div className="mt-6 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12 md:gap-16">
          <TitleSponsorMark size="lg" align="center" />
          <div className="hidden h-16 w-px shrink-0 bg-slate-200 sm:block" aria-hidden />
          <CoPoweredBySponsorMark size="lg" align="center" />
        </div>
      </div>
    </section>
  );
}
