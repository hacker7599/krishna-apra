import { BackToTop } from "@/components/back-to-top";
import { SiteAnnouncementBar } from "@/components/site-announcement-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteMobileCta } from "@/components/site-mobile-cta";
import "./site.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-app print:min-h-0">
      <div className="print-only-hide">
        <SiteHeader />
        <SiteAnnouncementBar />
      </div>
      <main className="site-main pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-0 print:overflow-visible print:pb-0">
        {children}
      </main>
      <div className="print-only-hide">
        <SiteFooter />
        <SiteMobileCta />
        <BackToTop />
      </div>
    </div>
  );
}
