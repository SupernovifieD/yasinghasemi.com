"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import styles from "@/components/site-shell.module.css";
import { isActivePath } from "@/lib/navigation";
import { primaryNavigation } from "@/lib/site-config";

/**
 * Hamburger menu built on a native <details> disclosure so it still opens
 * without JavaScript. The client code only adds closing behavior: Escape,
 * outside press, choosing a link, and route changes.
 */
export function MobileMenu({ pathname }: { pathname: string }) {
  // Remember where the menu was opened. A different pathname means the route
  // changed, so the menu reads as closed without an effect to reset it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) {
        setOpenAt(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenAt(null);
      summaryRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <details
      ref={detailsRef}
      className={styles.mobileMenu}
      open={open}
      onToggle={(event) =>
        setOpenAt(event.currentTarget.open ? pathname : null)
      }
    >
      <summary ref={summaryRef} className={styles.menuButton} aria-label="Menu">
        <svg
          className={styles.menuIcon}
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
          aria-hidden="true"
        >
          <path className={styles.menuIconTop} d="M4 7h16" />
          <path className={styles.menuIconMiddle} d="M4 12h16" />
          <path className={styles.menuIconBottom} d="M4 17h16" />
        </svg>
      </summary>
      <nav className={styles.mobilePanel} aria-label="Primary navigation">
        <ul className={styles.mobileList}>
          {primaryNavigation.map(({ href, label }) => (
            <li key={href}>
              <Link
                className={styles.mobileLink}
                href={href}
                aria-current={isActivePath(pathname, href) ? "page" : undefined}
                onClick={() => setOpenAt(null)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
