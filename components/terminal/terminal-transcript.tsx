import Link from "next/link";

import type { TranscriptEntry } from "@/lib/terminal/session";

import styles from "./terminal.module.css";

export function TerminalTranscript({
  entries,
  announcement,
}: {
  entries: TranscriptEntry[];
  announcement: string;
}) {
  return (
    <>
      {entries.length ? (
        <section
          className={styles.transcript}
          aria-label="Terminal command output"
          tabIndex={0}
        >
          {entries.map((entry) => (
            <div className={styles.transcriptEntry} key={entry.id}>
              <p className={styles.command}>
                <span aria-hidden="true">$ </span>
                {entry.command}
              </p>
              {entry.lines.map((line, index) => (
                <p
                  className={
                    entry.tone === "error"
                      ? styles.errorLine
                      : styles.outputLine
                  }
                  key={`${entry.id}-${index}`}
                >
                  {line.href ? (
                    <Link href={line.href}>{line.text}</Link>
                  ) : (
                    line.text
                  )}
                </p>
              ))}
            </div>
          ))}
        </section>
      ) : null}
      <p className={styles.visuallyHidden} role="status" aria-atomic="true">
        {announcement}
      </p>
    </>
  );
}
