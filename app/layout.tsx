import type { Metadata, Viewport } from "next";
import { Archivo, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site";
import Analytics from "./components/layout/Analytics";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import WhatsAppButton from "./components/layout/WhatsAppButton";
import SmoothScroll from "./components/motion/SmoothScroll";
import PageTransition from "./components/motion/PageTransition";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VyxrLabs | Custom software, automation & AI for growing businesses",
    template: "%s | VyxrLabs",
  },
  description:
    "VyxrLabs builds custom products, business automation, SaaS platforms and AI that plug into how your business runs. Builders of BlueSwan, Swan Power Dialer, WhatsApp Swan and Swan AI for Black Swan Refunds. Based in Sharjah, UAE.",
  openGraph: {
    siteName: "VyxrLabs",
    type: "website",
  },
  // Keeps the domain verified in Google Search Console (same token the previous site used).
  verification: { google: "rW5_8T3JxKLaBbBF892qMASoVCUM-Q3MMBrdmUdxUUk" },
};

export const viewport: Viewport = {
  themeColor: "#03050c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${playfair.variable} ${geistMono.variable}`}>
      <body className="grain">
        <Analytics />
        <a
          href="#main"
          data-transition="off"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-signal focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppButton />
        <PageTransition />
      </body>
    </html>
  );
}
