import Link from "next/link";

import { SiteNavigation } from "@/components/site-navigation";
import styles from "@/components/site-shell.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link className={styles.identity} href="/" aria-label="Home">
          yasinghasemi.com
        </Link>
        <SiteNavigation />
      </div>
    </header>
  );
}
