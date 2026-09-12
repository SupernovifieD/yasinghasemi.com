import Link from "next/link";

import styles from "@/components/site-shell.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <Link href="/">yasinghasemi.com</Link>
      </div>
    </footer>
  );
}
