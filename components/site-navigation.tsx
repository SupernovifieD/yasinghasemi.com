import Link from "next/link";

import styles from "@/components/site-shell.module.css";
import { isActivePath } from "@/lib/navigation";
import { primaryNavigation } from "@/lib/site-config";

export function SiteNavigation({ pathname }: { pathname: string }) {
  return (
    <nav className={styles.primaryNavigation} aria-label="Primary navigation">
      <ul className={styles.navigation}>
        {primaryNavigation.map(({ href, label }) => (
          <li key={href}>
            <Link
              className={styles.navigationLink}
              href={href}
              aria-current={isActivePath(pathname, href) ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
