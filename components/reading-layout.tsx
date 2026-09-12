import type { ReactNode } from "react";

import styles from "@/components/reading-layout.module.css";

export function ReadingLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className={styles.reading}>
      <div className={styles.prose}>{children}</div>
    </main>
  );
}
