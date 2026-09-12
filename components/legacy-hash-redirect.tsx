"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { matchLegacyHash } from "@/lib/legacy-routes";

import styles from "./site-shell.module.css";

export function LegacyHashRedirect() {
  const router = useRouter();
  const [unknownLegacyHash, setUnknownLegacyHash] = useState(false);

  useEffect(() => {
    if (window.location.pathname !== "/") return;

    let frame = 0;
    const inspectHash = () => {
      const match = matchLegacyHash(window.location.hash);
      if (match?.kind === "redirect") {
        router.replace(match.href, { scroll: false });
        return;
      }

      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setUnknownLegacyHash(match?.kind === "unknown");
      });
    };

    inspectHash();
    window.addEventListener("hashchange", inspectHash);

    return () => {
      window.removeEventListener("hashchange", inspectHash);
      window.cancelAnimationFrame(frame);
    };
  }, [router]);

  return (
    <>
      {unknownLegacyHash ? (
        <aside className={styles.legacyRecovery} aria-live="polite">
          That old document bookmark is no longer available. Browse{" "}
          <Link href="/blog">all posts</Link>.
        </aside>
      ) : null}
      <noscript>
        <p className={styles.noScriptNote}>
          Old hash bookmarks require JavaScript to move automatically.{" "}
          <Link href="/blog">Browse all posts</Link>.
        </p>
      </noscript>
    </>
  );
}
