import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import { SiteShell } from "@/components/site-shell";
import { siteConfig } from "@/lib/site-config";

import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-terminal",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  fallback: ["ui-monospace", "DejaVu Sans Mono", "Liberation Mono"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: {
    default: "Yasin Ghasemi",
    template: "%s | Yasin Ghasemi",
  },
  description:
    "Yasin Ghasemi writes about building software, project decisions, and lessons learned along the way.",
  alternates: { canonical: siteConfig.origin },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "Yasin Ghasemi",
    description:
      "Notes on software projects, the decisions behind them, and lessons learned along the way.",
    url: siteConfig.origin,
  },
  twitter: {
    card: "summary",
    title: "Yasin Ghasemi",
    description:
      "Notes on software projects, the decisions behind them, and lessons learned along the way.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={jetBrainsMono.variable}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
