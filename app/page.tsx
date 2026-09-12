import Link from "next/link";

import styles from "@/app/home.module.css";

export default function HomePage() {
  return (
    <main className={styles.home} id="main-content">
      <div className={styles.introduction}>
        <h1>Hello, I&apos;m Yasin Ghasemi.</h1>
        <div className={styles.copy}>
          <p>I build things and write about the process.</p>
          <p>
            This is where I share notes on my projects, the decisions behind
            them, and what I learn along the way.
          </p>
        </div>
        <Link className={styles.blogLink} href="/blog">
          Read the blog <span aria-hidden="true">→</span>
        </Link>
        <p className={styles.hint}>
          Try <code>cd blog</code> or type <code>help</code>.
        </p>
      </div>
    </main>
  );
}
