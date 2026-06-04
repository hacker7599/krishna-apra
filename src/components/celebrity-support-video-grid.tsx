"use client";

import { useEffect, useState } from "react";
import { CelebritySupportVideoPlayer } from "@/components/celebrity-support-video-player";
import { CELEBRITY_SUPPORT_VIDEOS } from "@/lib/celebrity-support-videos";

function VideoGridSkeleton() {
  return (
    <ul className="celebrity-support-section__grid celebrity-support-section__grid--loading" aria-hidden>
      {[1, 2, 3].map((n) => (
        <li key={n} className="celebrity-support-section__card celebrity-support-section__card--skeleton" />
      ))}
    </ul>
  );
}

/** Renders videos only in the browser (after mount) to avoid hydration/extension issues. */
export function CelebritySupportVideoGrid() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <VideoGridSkeleton />;
  }

  return (
    <ul className="celebrity-support-section__grid">
      {CELEBRITY_SUPPORT_VIDEOS.map((video) => (
        <li key={video.id} className="celebrity-support-section__card">
          <div className="celebrity-support-section__media">
            <CelebritySupportVideoPlayer src={video.src} title={video.title} variant="card" />
          </div>
          <div className="celebrity-support-section__card-copy">
            <span className="celebrity-support-section__index">Personal message</span>
            <p className="celebrity-support-section__card-title">{video.title}</p>
            <p className="celebrity-support-section__card-sub">{video.subtitle}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
