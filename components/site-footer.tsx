import Link from "next/link";

import styles from "@/components/site-shell.module.css";
import { policyNavigation } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p className={styles.copyright}>
          {/* Each segment stays whole, so a phone wraps between them, never
              inside one or with a stray separator opening a line. */}
          <span className={styles.copyrightPart}>
            <Link href="/">yasinghasemi.com</Link> ·
          </span>{" "}
          <span className={styles.copyrightPart}>
            2026<span className={styles.copyrightSeparator}> ·</span>
          </span>{" "}
          <span className={styles.copyrightPart}>© All rights reserved</span>
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
