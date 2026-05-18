"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
    const t = setInterval(next, 7500);
    return () => clearInterval(t);
  }, [n, next]);

  if (n === 0) return null;

  const b = banners[index]!;

  return (
    <section className="relative border-b border-slate-200 bg-slate-900" aria-roledescription="carousel">
      <div className="relative aspect-[21/9] min-h-[200px] w-full max-h-[420px] sm:min-h-[240px] md:max-h-[480px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={b.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/20" />
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-10 pt-16 sm:px-8 md:px-12">
          <div className="mx-auto w-full max-w-5xl">
            {b.title && <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow sm:text-4xl md:text-5xl">{b.title}</h2>}
            {b.subtitle && <p className="mt-2 max-w-2xl text-sm font-semibold text-orange-100 drop-shadow sm:text-lg">{b.subtitle}</p>}
            {b.ctaHref && b.ctaLabel && (
              <Link
                href={b.ctaHref}
                className="mt-5 inline-flex w-fit rounded-lg bg-orange-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-orange-500"
              >
                {b.ctaLabel}
              </Link>
            )}
          </div>
        </div>
        {n > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-lg text-white backdrop-blur hover:bg-black/60 sm:left-4"
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-lg text-white backdrop-blur hover:bg-black/60 sm:right-4"
              aria-label="Next slide"
            >
              ›
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {banners.map((_, i) => (
                <button
                  key={banners[i]!.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition ${i === index ? "w-8 bg-orange-500" : "w-2 bg-white/50 hover:bg-white/80"}`}
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
