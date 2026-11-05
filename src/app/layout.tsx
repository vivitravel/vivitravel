import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vivitravel.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vivitravels | Viví más destinos",
    template: "%s | Vivitravels",
  },
  description:
    "Descubrí destinos, alojamientos, actividades y gastronomía en toda la Argentina y contactá directo con los prestadores.",
  openGraph: {
    siteName: "Vivitravels",
    locale: "es_AR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { page_path: window.location.pathname });
            `}</Script>
          </>
        )}
        <Suspense fallback={<div className="h-16 border-b border-border-soft" />}>
          <SiteHeader />
        </Suspense>
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
