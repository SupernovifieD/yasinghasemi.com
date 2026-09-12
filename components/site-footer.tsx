import Link from "next/link";

import styles from "@/components/site-shell.module.css";
import { policyNavigation } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p className={styles.copyright}>
          <Link href="/">yasinghasemi.com</Link> · 2026 · © All rights reserved
        </p>
        <nav aria-label="Policy navigation">
          <ul className={styles.policyNavigation}>
            {policyNavigation.map(({ href, label }) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
