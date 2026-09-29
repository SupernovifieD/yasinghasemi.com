import type { ReactNode } from "react";

import styles from "@/components/reading-layout.module.css";

export function ReadingLayout({
  children,
  placement = "reading",
}: {
  children: ReactNode;
  placement?: "reading" | "short";
}) {
  const isShortPage = placement === "short";
  return (
    <main
      id="main-content"
      className={isShortPage ? styles.shortPage : styles.reading}
      tabIndex={-1}
    >
      <div className={isShortPage ? styles.shortContent : styles.prose}>
        {children}
      </div>
    </main>
  );
}
