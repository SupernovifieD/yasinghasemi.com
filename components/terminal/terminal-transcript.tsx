"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import type { TerminalOutput } from "@/lib/terminal/session";

import styles from "./terminal.module.css";

export function TerminalTranscript({
  output,
  announcement,
}: {
  output: TerminalOutput | null;
  announcement: string;
}) {
  const outputRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = 0;
  }, [output]);

  return (
    <>
      {output ? (
        <section
          ref={outputRef}
          className={styles.transcript}
          aria-label="Terminal command output"
          tabIndex={0}
        >
          {output.lines.map((line, index) => (
            <p
              className={
                output.tone === "error" ? styles.errorLine : styles.outputLine
              }
              key={index}
            >
              {line.href ? (
                <Link href={line.href}>{line.text}</Link>
              ) : (
                line.text
              )}
            </p>
          ))}
        </section>
      ) : null}
      <p className={styles.visuallyHidden} role="status" aria-atomic="true">
        {announcement}
      </p>
    </>
  );
}
