"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileMenu } from "@/components/mobile-menu";
import { SiteNavigation } from "@/components/site-navigation";
import styles from "@/components/site-shell.module.css";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  const pathname = usePathname();
  // The home page replaces the desktop header with its own navigation; CSS
  // keeps it on narrow screens, so there is no JavaScript layout switch.
  const className =
    pathname === "/" ? `${styles.header} ${styles.headerHome}` : styles.header;

  return (
    <header className={className}>
      <div className={styles.headerInner}>
        <Link className={styles.wordmark} href="/">
          {siteConfig.name}
        </Link>
        <SiteNavigation pathname={pathname} />
        <MobileMenu pathname={pathname} />
      </div>
    </header>
  );
}
