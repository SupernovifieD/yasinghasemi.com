"use client";

import { useState } from "react";

import { BootstrapIcon } from "@/components/icons/bootstrap-icon";
import type { BootstrapGlyphName } from "@/components/icons/bootstrap-icons";
import styles from "@/components/projects/project-browser.module.css";
import { projectCategories, type ProjectCategory } from "@/lib/projects";

const categoryIcons: Record<ProjectCategory, BootstrapGlyphName> = {
  software: "terminal",
  web: "globe",
};

/**
 * The /projects directory: two category toggles that reveal a project list
 * each. Clicking the open category closes it; clicking the other one switches.
 */
export function ProjectBrowser() {
  const [open, setOpen] = useState<ProjectCategory | null>(null);

  return (
    <div className={styles.browser}>
      <div
        className={styles.toggles}
        role="group"
        aria-label="Project categories"
      >
        {projectCategories.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={styles.toggle}
            aria-expanded={open === id}
            onClick={() => setOpen((current) => (current === id ? null : id))}
          >
            <span className={styles.iconStage}>
              <span className={styles.glow} aria-hidden="true" />
              <BootstrapIcon name={categoryIcons[id]} className={styles.icon} />
            </span>
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
