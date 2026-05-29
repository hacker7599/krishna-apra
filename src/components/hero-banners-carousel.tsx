"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SITE_CONTAINER } from "@/lib/site-ui";
import { cn } from "@/lib/cn";
import { REGION } from "@/lib/league";

export type HeroBannerDTO = {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d={direction === "left" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  const slideLabel = String(index + 1).padStart(2, "0");
  const slideTotal = String(n).padStart(2, "0");

  return (
    <section className="site-hero" aria-roledescription="carousel" aria-label="Featured highlights">
      <div className="site-hero__frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={b.id}
          src={b.imageUrl}
          alt={b.title ?? "Future Star Under-15 cricket"}
          className="site-hero__img"
        />
        <div className="site-hero__scrim" aria-hidden />
        <div className="site-hero__accent" aria-hidden />

        <div className="site-hero__content">
          <div className={cn(SITE_CONTAINER, "site-hero__container")}>
            <div className="site-hero__panel">
              <p className="site-hero__eyebrow">
                <span className="site-hero__eyebrow-mark" aria-hidden />
                Future Star · Under-15 · {REGION}
              </p>
              {b.title ? <h2 className="site-hero__title">{b.title}</h2> : null}
              {b.subtitle ? <p className="site-hero__subtitle">{b.subtitle}</p> : null}
              {b.ctaHref && b.ctaLabel ? (
                <div className="site-hero__actions">
                  <Link href={b.ctaHref} className="site-hero__btn site-hero__btn--primary">
                    {b.ctaLabel}
                  </Link>
                  <Link href="/about" className="site-hero__btn site-hero__btn--ghost">
                    About the league
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {n > 1 ? (
          <>
            <button type="button" onClick={prev} className="site-hero__nav site-hero__nav--prev" aria-label="Previous slide">
              <ChevronIcon direction="left" />
            </button>
            <button type="button" onClick={next} className="site-hero__nav site-hero__nav--next" aria-label="Next slide">
              <ChevronIcon direction="right" />
            </button>
            <div className={cn(SITE_CONTAINER, "site-hero__meta")}>
              <span className="site-hero__counter" aria-live="polite">
                {slideLabel}
                <span className="site-hero__counter-sep">/</span>
                {slideTotal}
              </span>
              <div className="site-hero__dots" role="tablist" aria-label="Choose slide">
                {banners.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    onClick={() => setIndex(i)}
                    className={cn("site-hero__dot", i === index && "is-active")}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-selected={i === index}
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
