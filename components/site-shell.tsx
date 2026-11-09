import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import styles from "@/components/site-shell.module.css";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <div className={styles.shell}>
        <SiteHeader />
        <div className={styles.main}>{children}</div>
        <SiteFooter />
      </div>
    </>
  );
}
