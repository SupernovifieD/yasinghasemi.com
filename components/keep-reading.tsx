import Link from "next/link";

import styles from "@/components/keep-reading.module.css";

export type KeepReadingItem = {
  href: string;
  title: string;
  description: string;
};

/**
 * The end of a post or project page: a hairline divider, then a few other
 * pages to read next. Plain linked rows, not cards. The list is made of divs
 * with list roles because the reading layout restyles real lists.
 */
export function KeepReading({
  heading,
  items,
}: {
  heading: string;
  items: readonly KeepReadingItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className={styles.keepReading} aria-labelledby="keep-reading">
      <div className={styles.divider} aria-hidden="true">
        /
      </div>
      <h2 id="keep-reading" className={styles.heading}>
        {heading}
      </h2>
      <div className={styles.items} role="list">
        {items.map(({ href, title, description }) => (
          <div key={href} className={styles.item} role="listitem">
            <Link className={styles.link} href={href}>
              <span className={styles.title}>{title}</span>
              <span className={styles.description}>{description}</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
