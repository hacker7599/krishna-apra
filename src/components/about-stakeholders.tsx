import Image from "next/image";
import { MediaSlot } from "@/components/media-slot";
import { SectionHeader } from "@/components/section-header";
import { ABOUT_STAKEHOLDERS } from "@/lib/about-stakeholders";
import { formatImageUploadSpecShort } from "@/lib/image-upload-specs";
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
    const isLargeLogo = id === "krishna-apra";
    const logoEyebrow = id === "krishna-apra" ? "Title sponsor" : "Partner";
    return (
      <div className={`flex w-full flex-col items-center gap-2 ${isLargeLogo ? "max-w-[320px]" : "max-w-[200px]"}`}>
        <span className="eyebrow">{logoEyebrow}</span>
        <div
          className={`flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm ${
            isLargeLogo ? "min-h-[10rem] p-6 sm:min-h-[11rem] sm:p-8" : "min-h-[5rem] p-4"
          }`}
        >
          <Image
            src={logoSrc}
            alt={name}
            width={isLargeLogo ? 320 : 200}
            height={isLargeLogo ? 160 : 80}
            unoptimized
            className={
              isLargeLogo ? "h-24 w-auto max-w-full object-contain sm:h-28 md:h-32" : "h-14 w-auto object-contain"
            }
          />
        </div>
      </div>
    );
  }

  if (portraitSrc?.trim()) {
    return (
      <div className="relative h-[275px] w-[220px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Image
          src={portraitSrc}
          alt={name}
          fill
          unoptimized
          className="object-cover object-top"
          sizes="220px"
          priority={id === "naresh" || id === "mr-gupta"}
        />
      </div>
    );
  }

  return (
    <MediaSlot
      src={portraitSrc}
      alt={name}
      label="Portrait"
      suggestedPath={`/home/about/${id}.jpg`}
      className="w-[220px]"
      sizes="220px"
      sizeHint={`Exact size: ${formatImageUploadSpecShort("aboutPortrait")}`}
    />
  );
}

export function AboutStakeholders() {
  return (
    <section className={SECTION_MUTED} aria-labelledby="about-stakeholders-heading">
      <div className={SITE_CONTAINER_NARROW}>
        <SectionHeader
          title="People & partners behind the league"
          lead="Future Star U-15 is built through the combined leadership of our title sponsor and league stewards across Delhi NCR."
        />

        <ul className="mt-12 space-y-12">
          {ABOUT_STAKEHOLDERS.map((person, index) => (
            <li
              key={person.id}
              className={`flex flex-col gap-8 border-t border-slate-200 pt-12 first:border-t-0 first:pt-0 lg:flex-row lg:items-start lg:gap-10 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div
                className={`mx-auto flex shrink-0 justify-center lg:mx-0 lg:justify-start ${
                  person.logoSrc && person.id === "krishna-apra"
                    ? "w-full max-w-[320px] sm:w-[320px]"
                    : "w-[220px]"
                }`}
              >
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
