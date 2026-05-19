import Image from "next/image";
import { MediaSlot } from "@/components/media-slot";
import { SectionHeader } from "@/components/section-header";
import { ABOUT_STAKEHOLDERS } from "@/lib/about-stakeholders";
import { SECTION_MUTED, SITE_CONTAINER_NARROW } from "@/lib/site-ui";

function StakeholderVisual({
  portraitSrc,
  logoSrc,
  name,
  id,
}: {
  portraitSrc?: string;
  logoSrc?: string;
  name: string;
  id: string;
}) {
  if (logoSrc) {
    return (
      <div className="flex w-full max-w-[200px] flex-col items-center gap-2">
        <span className="eyebrow">Title sponsor</span>
        <div className="flex min-h-[5rem] w-full items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Image src={logoSrc} alt={name} width={200} height={80} unoptimized className="h-14 w-auto object-contain" />
        </div>
      </div>
    );
  }

  return (
    <MediaSlot
      src={portraitSrc}
      alt={name}
      label="Portrait"
      suggestedPath={`/home/about/${id}.jpg`}
      className="max-w-[220px]"
      sizes="220px"
    />
  );
}

export function AboutStakeholders() {
  return (
    <section className={SECTION_MUTED} aria-labelledby="about-stakeholders-heading">
      <div className={SITE_CONTAINER_NARROW}>
        <SectionHeader
          title="People & partners behind the league"
          lead="Future Star U-15 is built through the combined leadership of our title sponsor, league stewards, and the Outer Delhi Warriors franchise initiative."
        />

        <ul className="mt-12 space-y-12">
          {ABOUT_STAKEHOLDERS.map((person, index) => (
            <li
              key={person.id}
              className={`flex flex-col gap-8 border-t border-slate-200 pt-12 first:border-t-0 first:pt-0 lg:flex-row lg:items-start lg:gap-10 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="flex shrink-0 justify-center lg:justify-start">
                <StakeholderVisual portraitSrc={person.portraitSrc} logoSrc={person.logoSrc} name={person.name} id={person.id} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="eyebrow text-orange-700">{person.role}</p>
                <h3 className="mt-1 font-[family-name:var(--font-bebas)] text-3xl uppercase tracking-wide text-slate-900 sm:text-4xl">{person.name}</h3>
                <div className="prose-league mt-5 space-y-4 text-base font-medium">
                  {person.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
