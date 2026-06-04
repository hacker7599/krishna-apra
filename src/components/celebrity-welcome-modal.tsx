"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CelebritySupportVideoPlayer } from "@/components/celebrity-support-video-player";
import {
  CELEBRITY_WELCOME_STORAGE_KEY,
  type CelebritySupportVideo,
  pickRandomCelebrityVideo,
} from "@/lib/celebrity-support-videos";
import { BTN_PRIMARY } from "@/lib/site-ui";

function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(CELEBRITY_WELCOME_STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

function markWelcomeSeen(): void {
  try {
    localStorage.setItem(CELEBRITY_WELCOME_STORAGE_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function CelebrityWelcomeModal() {
  const [open, setOpen] = useState(false);
  const [video, setVideo] = useState<CelebritySupportVideo | null>(null);

  useEffect(() => {
    if (hasSeenWelcome()) return;
    setVideo(pickRandomCelebrityVideo());
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    markWelcomeSeen();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open || !video) return null;

  return (
    <div className="celebrity-welcome" role="dialog" aria-modal="true" aria-labelledby="celebrity-welcome-title">
      <button type="button" className="celebrity-welcome__backdrop" aria-label="Close welcome video" onClick={close} />
      <div className="celebrity-welcome__panel">
        <div className="celebrity-welcome__accent" aria-hidden />
        <button type="button" className="celebrity-welcome__close" onClick={close} aria-label="Close">
          ✕
        </button>
        <div className="celebrity-welcome__head">
          <p className="celebrity-welcome__eyebrow">Stars backing the league</p>
          <h2 id="celebrity-welcome-title" className="celebrity-welcome__title">
            {video.title}
          </h2>
          <p className="celebrity-welcome__subtitle">{video.subtitle}</p>
        </div>
        <CelebritySupportVideoPlayer
          src={video.src}
          title={video.title}
          autoPlay
          showControls
          variant="modal"
        />
        <div className="celebrity-welcome__actions">
          <button type="button" onClick={close} className={`${BTN_PRIMARY} celebrity-welcome__cta`}>
            Continue to website
          </button>
          <Link href="/register" className="celebrity-welcome__register" onClick={close}>
            Book a trial slot →
          </Link>
        </div>
      </div>
    </div>
  );
}
