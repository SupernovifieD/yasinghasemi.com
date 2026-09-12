import type { ReactNode } from "react";

import { LegacyHashRedirect } from "@/components/legacy-hash-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import styles from "@/components/site-shell.module.css";
import { getPublishedPosts } from "@/lib/posts";
import { createPublicRouteRegistry } from "@/lib/terminal/routes";

export function SiteShell({ children }: { children: ReactNode }) {
  const registry = createPublicRouteRegistry(
    getPublishedPosts().map(({ slug }) => slug),
  );

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <div className={styles.shell}>
        <SiteHeader registry={registry} />
        <LegacyHashRedirect />
        <div className={styles.main}>{children}</div>
        <SiteFooter />
      </div>
    </>
  );
}
