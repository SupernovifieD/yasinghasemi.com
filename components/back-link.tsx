import Link from "next/link";
import type { ReactNode } from "react";

import styles from "@/components/back-link.module.css";

/** The "← Back to ..." link at the top of a detail page (post, project). */
export function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={styles.backLink}>
      ← {children}
    </Link>
  );
}
