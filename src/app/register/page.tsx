import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { cricketTeamGame } from "@/lib/remote-images";
import { LEAGUE_NAME, TITLE_SPONSOR } from "@/lib/league";

const sideImg = cricketTeamGame(900);

export const metadata: Metadata = {
  title: `Trial Registration · ${LEAGUE_NAME}`,
  description: `Official trial registration for the ${TITLE_SPONSOR} Future Star Under-15 Cricket League (Delhi NCR).`,
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <aside className="card-elevated flex flex-col overflow-hidden rounded-2xl lg:col-span-4">
          <div className="relative aspect-[4/3] w-full shrink-0 border-b border-slate-200 bg-slate-100 lg:aspect-[3/4]">
            <Image src={sideImg} alt="Cricket on a green field" fill className="object-cover" sizes="(max-width:1024px) 100vw, 380px" />
          </div>
          <div className="space-y-2 p-6">
            <p className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-slate-900">Official trial form</p>
            <p className="text-sm font-semibold text-slate-700">Backed by {TITLE_SPONSOR}</p>
            <p className="text-sm font-medium leading-relaxed text-slate-600">
              Complete all fields. Payment proof and transaction ref help us verify your slot faster.
            </p>
            <p className="pt-2 text-sm font-medium leading-relaxed text-slate-600">
              Prefer paper?{" "}
              <Link href="/register/offline" className="font-bold text-orange-700 underline underline-offset-2 hover:text-orange-800">
                Download the printable offline form
              </Link>{" "}
              (print or save as PDF) and submit at your academy or league desk.
            </p>
          </div>
        </aside>
        <div className="min-w-0 lg:col-span-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
