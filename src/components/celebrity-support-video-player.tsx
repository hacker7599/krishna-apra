"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  title: string;
  className?: string;
  /** Autoplay when mounted (welcome modal). Browsers require muted for autoplay. */
  autoPlay?: boolean;
  /** Show native controls in the page section. */
  showControls?: boolean;
  /** Compact card layout for the homepage grid. */
  variant?: "card" | "modal";
};

export function CelebritySupportVideoPlayer({
  src,
  title,
  className,
  autoPlay = false,
  showControls = true,
  variant = "card",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(autoPlay);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !autoPlay) return;
    el.muted = true;
    void el.play().catch(() => {
      /* Autoplay blocked — user can tap play */
    });
  }, [autoPlay, src]);

  const playVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    setLoadError(false);
    void el.play().catch(() => {
      setLoadError(true);
    });
  }, []);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    const next = !el.muted;
    el.muted = next;
    setMuted(next);
  }, []);

  return (
    <div
      className={cn(
        "celebrity-video-player",
        variant === "modal" && "celebrity-video-player--modal",
        variant === "card" && "celebrity-video-player--card",
        className,
      )}
    >
      <video
        ref={videoRef}
        src={src}
        title={title}
        className="celebrity-video-player__video"
        playsInline
        preload="metadata"
        muted={muted}
        autoPlay={autoPlay}
        controls={showControls}
        suppressHydrationWarning
        onPlay={() => {
          setPlaying(true);
          setLoadError(false);
        }}
        onPause={() => setPlaying(false)}
        onError={() => setLoadError(true)}
      />

      {autoPlay && muted ? (
        <button type="button" className="celebrity-video-player__unmute" onClick={toggleMute}>
          Tap for sound
        </button>
      ) : null}

      {!autoPlay && !playing && variant === "card" ? (
        <button
          type="button"
          className="celebrity-video-player__play-btn"
          onClick={playVideo}
          aria-label={`Play message from ${title}`}
        >
          <span className="celebrity-video-player__play-icon" aria-hidden>
            ▶
          </span>
          <span className="celebrity-video-player__play-label">Play message</span>
        </button>
      ) : null}

      {loadError ? (
        <p className="celebrity-video-player__error" role="status">
          Could not load video.{" "}
          <a href={src} className="underline">
            Open file
          </a>
        </p>
      ) : null}
    </div>
  );
}
