"use client";

import Link from "next/link";
import { CelebritySupportVideoGrid } from "@/components/celebrity-support-video-grid";
import { SectionHeader } from "@/components/section-header";
import { SiteSection } from "@/components/site-section";
import { BTN_PRIMARY } from "@/lib/site-ui";

export function CelebritySupportSection() {
  return (
    <SiteSection id="celebrity-support" tone="accent" width="content" className="celebrity-support-section">
      <div className="celebrity-support-section__inner">
        <SectionHeader
          eyebrow="League support"
          title="Stars backing Future Star U-15"
          lead="Watch personal messages from Yuzvendra Chahal, Mr. Aakash Chopra, and Piyush Chawla — cheering on Delhi NCR&apos;s next generation with the same energy we bring to trials, franchises, and match days."
          align="center"
        />

        <CelebritySupportVideoGrid />

        <div className="celebrity-support-section__cta">
          <p className="celebrity-support-section__cta-text">
            Inspired? Secure your player&apos;s trial slot while registrations are open.
          </p>
          <Link href="/register" className={BTN_PRIMARY}>
            Start registration
          </Link>
        </div>
      </div>
    </SiteSection>
  );
}
