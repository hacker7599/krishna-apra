import type { Metadata } from "next";
import { Barlow_Condensed, Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import { LEAGUE_NAME, LEAGUE_SUBTITLE, REGION, TITLE_SPONSOR } from "@/lib/league";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const flash = Barlow_Condensed({
  weight: ["600", "700"],
  style: ["italic", "normal"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

export const metadata: Metadata = {
  title: `${LEAGUE_NAME} ${LEAGUE_SUBTITLE} · ${TITLE_SPONSOR}`,
  description: `Premier Under-15 franchise cricket in ${REGION}. Trials, live broadcast, and a pathway to high-performance training — Future Star U-15 in Delhi NCR.`,
  openGraph: {
    title: `${LEAGUE_NAME} · ${TITLE_SPONSOR}`,
    description: `${LEAGUE_SUBTITLE} in ${REGION}.`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${display.variable} ${sans.variable} ${flash.variable} h-full`}
    >
      <body suppressHydrationWarning className="flex min-h-full flex-col antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}
