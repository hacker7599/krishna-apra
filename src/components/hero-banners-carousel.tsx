"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BTN_PRIMARY, BTN_SECONDARY, SITE_CONTAINER } from "@/lib/site-ui";
import { cn } from "@/lib/cn";

export type HeroBannerDTO = {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export function HeroBannersCarousel({ banners }: { banners: HeroBannerDTO[] }) {
  const [index, setIndex] = useState(0);
  const n = banners.length;

  const next = useCallback(() => setIndex((i) => (n <= 0 ? 0 : (i + 1) % n)), [n]);
  const prev = useCallback(() => setIndex((i) => (n <= 0 ? 0 : (i - 1 + n) % n)), [n]);

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(next, 8000);
    return () => clearInterval(t);
  }, [n, next]);

  if (n === 0) return null;

  const b = banners[index]!;

  return (
    <section className="relative border-b border-slate-200 bg-white" aria-roledescription="carousel">
      <div className="relative w-full min-h-[min(68vh,560px)] sm:min-h-[min(72vh,640px)] lg:min-h-[min(78vh,820px)] max-h-[92vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={b.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[38%] bg-gradient-to-t from-white/92 via-white/45 to-transparent sm:top-[42%]"
          aria-hidden
        />

        <div className="absolute inset-0 flex flex-col justify-end pb-8 pt-24 sm:pb-12 sm:pt-28">
          <div className={cn(SITE_CONTAINER, "w-full")}>
            {b.title ? (
              <h2 className="max-w-4xl font-[family-name:var(--font-barlow)] text-3xl font-bold italic leading-[1.05] tracking-tight text-slate-900 drop-shadow-[0_1px_3px_rgba(255,255,255,0.85)] sm:text-5xl lg:text-6xl">
                {b.title}
              </h2>
            ) : null}
            {b.subtitle ? (
              <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] sm:text-lg">
                {b.subtitle}
              </p>
            ) : null}
            {b.ctaHref && b.ctaLabel ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href={b.ctaHref} className={`${BTN_PRIMARY} w-full sm:w-auto`}>
                  {b.ctaLabel}
                </Link>
                <Link href="/about" className={`${BTN_SECONDARY} w-full sm:w-auto`}>
                  About the league
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 z-10 flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-white/90 text-xl text-slate-800 shadow-md transition hover:bg-white sm:left-6"
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-10 flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-white/90 text-xl text-slate-800 shadow-md transition hover:bg-white sm:right-6"
              aria-label="Next slide"
            >
              ›
            </button>
            <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 sm:bottom-7">
              {banners.map((_, i) => (
                <button
                  key={banners[i]!.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "min-h-2.5 rounded-full transition-all",
                    i === index ? "w-10 bg-orange-500" : "w-2.5 bg-slate-400/60 hover:bg-slate-500",
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
