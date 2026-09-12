import Link from "next/link";

import { ReadingLayout } from "@/components/reading-layout";

import styles from "./error-state.module.css";

export default function NotFound() {
  return (
    <ReadingLayout>
      <p aria-hidden="true">404</p>
      <h1>Page not found</h1>
      <p>The requested public route does not exist.</p>
      <p className={styles.actions}>
        <Link href="/">Return home</Link>
        <Link href="/blog">View all posts</Link>
      </p>
    </ReadingLayout>
  );
}
