import type { Metadata } from "next";
import localFont from "next/font/local";

import { SiteShell } from "@/components/site-shell";
import { siteConfig } from "@/lib/site-config";

import "./globals.css";

const jetBrainsMono = localFont({
  variable: "--font-terminal",
  src: [
    {
      path: "./fonts/JetBrainsMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/JetBrainsMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/JetBrainsMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  adjustFontFallback: false,
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
