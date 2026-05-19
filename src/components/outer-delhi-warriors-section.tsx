import { MediaSlot } from "@/components/media-slot";
import { SectionHeader } from "@/components/section-header";
import { ODW_TEAM_IN_UNIFORM, OUTER_DELHI_WARRIORS } from "@/lib/outer-delhi-warriors";
import { CARD_PAD, SECTION_MUTED, SITE_CONTAINER } from "@/lib/site-ui";

export function OuterDelhiWarriorsSection() {
  return (
    <section className={SECTION_MUTED} aria-labelledby="odw-heading">
      <div className={SITE_CONTAINER}>
        <div className="flex flex-wrap items-center gap-4">
          <img src="/branding/outer-delhi-warriors.svg" alt="" width={120} height={72} className="h-12 w-auto object-contain sm:h-14" />
          <span className="rounded-md bg-orange-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Season 1 initiative</span>
        </div>

        <SectionHeader
          eyebrow={OUTER_DELHI_WARRIORS.tagline}
          title={OUTER_DELHI_WARRIORS.name}
          lead="Powering Future Star U-15 — on-ground operators driving trials, franchises, and match-day standards."
          className="mt-6 max-w-3xl"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className={CARD_PAD}>
            <h3 className="eyebrow text-orange-700">Who they are</h3>
            <p className="prose-league mt-4 text-base font-medium">{OUTER_DELHI_WARRIORS.whoTheyAre}</p>
          </div>
          <div className={CARD_PAD}>
            <h3 className="eyebrow text-orange-700">How they support this vision</h3>
            <p className="prose-league mt-4 text-base font-medium">{OUTER_DELHI_WARRIORS.howTheySupport}</p>
          </div>
        </div>

        <div className="mt-14">
          <h3 id="odw-heading" className="text-center font-[family-name:var(--font-bebas)] text-3xl uppercase tracking-wide text-slate-900 sm:text-4xl">
            The team behind the league
          </h3>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {ODW_TEAM_IN_UNIFORM.map((m) => (
              <li key={m.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <MediaSlot
                  src={m.portraitSrc}
                  alt={m.name}
                  label="Uniform photo"
                  suggestedPath={m.suggestedPath}
                  aspectClassName="aspect-[3/4]"
                  sizes="(max-width:640px) 45vw, 220px"
                />
                <div className="border-t border-slate-200 px-2 py-3 text-center">
                  <p className="text-xs font-bold text-slate-900 sm:text-sm">{m.name}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
