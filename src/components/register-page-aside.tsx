import Image from "next/image";
import { RegisterFormOutline } from "@/components/register-form-outline";
import { CARD } from "@/lib/site-ui";
import { FORMAT, SEASON_START, TRIAL_FEE_INR } from "@/lib/league";

type Props = {
  imageSrc: string;
  imageAlt?: string;
};

const CHECKLIST = [
  "Government age proof (Aadhaar, passport, or birth certificate)",
  "Recent player photo (JPG, PNG, or WebP)",
  "Player roles and preferred trial venue",
  "Payment via Razorpay or league QR (as configured)",
] as const;

export function RegisterPageAside({ imageSrc, imageAlt = "Cricket on a green field" }: Props) {
  return (
    <aside className={`${CARD} register-page-aside flex flex-col overflow-hidden lg:sticky lg:top-24 lg:self-start`}>
      <div className="register-page-aside__hero relative aspect-[5/3] w-full shrink-0 sm:aspect-[16/9] lg:aspect-[4/3]">
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" sizes="(max-width:1024px) 100vw, 360px" priority />
        <div className="register-page-aside__hero-overlay absolute inset-0" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-200">Official trials</p>
          <p className="font-[family-name:var(--font-bebas)] text-2xl leading-none tracking-wide text-white sm:text-3xl">
            {SEASON_START}
          </p>
        </div>
      </div>

      <div className="register-page-aside__body flex flex-col gap-5 p-5 sm:p-6">
        <div className="register-page-aside__fee">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Trial registration fee</p>
            <p className="font-[family-name:var(--font-bebas)] text-4xl leading-none text-[#0c1f3d]">
              ₹{TRIAL_FEE_INR.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">Includes league jersey · {FORMAT.category}</p>
          </div>
          <div className="rounded-lg bg-[#0c1f3d] px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wide text-orange-300">Format</p>
            <p className="text-xs font-bold text-white">{FORMAT.overs}-over T20</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#1B365D]">Before you start</p>
          <ul className="mt-3 space-y-2.5">
            {CHECKLIST.map((item, i) => (
              <li key={item} className="flex gap-2.5 text-sm font-medium leading-snug text-slate-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-bold text-orange-800">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <RegisterFormOutline variant="sidebar" className="hidden border-t border-slate-200 pt-5 lg:block" />
      </div>
    </aside>
  );
}
