"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "@/components/site-shell.module.css";
import { primaryNavigation } from "@/lib/site-config";

function isActivePath(pathname: string, href: string) {
  return (
    pathname === href || (href === "/blog" && pathname.startsWith("/blog/"))
  );
}

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation">
      <ul className={styles.navigation}>
        {primaryNavigation.map(({ href, label }) => {
          const active = isActivePath(pathname, href);

          return (
            <li key={href}>
              <Link
                className={styles.navigationLink}
                href={href}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
