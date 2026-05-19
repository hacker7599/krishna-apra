import { BackToTop } from "@/components/back-to-top";
import { SiteAnnouncementBar } from "@/components/site-announcement-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteMobileCta } from "@/components/site-mobile-cta";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <SiteAnnouncementBar />
      <main className="relative flex-1 overflow-x-hidden pb-20 sm:pb-0">{children}</main>
      <SiteFooter />
      <SiteMobileCta />
      <BackToTop />
    </>
  );
}
