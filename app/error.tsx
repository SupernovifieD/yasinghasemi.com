"use client";

import Link from "next/link";

import { ReadingLayout } from "@/components/reading-layout";

import styles from "./error-state.module.css";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <ReadingLayout>
      <p aria-hidden="true">error</p>
      <h1>Something went wrong</h1>
      <p>
        The page could not be rendered. You can try it again or return home.
      </p>
      <div className={styles.actions}>
        <button className={styles.retry} type="button" onClick={reset}>
          Try again
        </button>
        <Link href="/">Return home</Link>
      </div>
    </ReadingLayout>
  );
}
