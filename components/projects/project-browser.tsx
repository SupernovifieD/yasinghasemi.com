"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { BootstrapIcon } from "@/components/icons/bootstrap-icon";
import type { BootstrapGlyphName } from "@/components/icons/bootstrap-icons";
import styles from "@/components/projects/project-browser.module.css";
import {
  projectCategories,
  projectsInCategory,
  type ProjectCategory,
} from "@/lib/projects";

const categoryIcons: Record<ProjectCategory, BootstrapGlyphName> = {
  software: "terminal",
  web: "globe",
};

/**
 * The /projects directory: two category toggles that reveal a project list
 * each. Clicking the open category closes it; clicking the other one switches
 * (one closes while the other opens).
 */
export function ProjectBrowser() {
  const [open, setOpen] = useState<ProjectCategory | null>(null);
  const uid = useId();
  const toggleId = (id: ProjectCategory) => `${uid}-toggle-${id}`;
  const panelId = (id: ProjectCategory) => `${uid}-panel-${id}`;

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
            id={toggleId(id)}
            type="button"
            className={styles.toggle}
            aria-expanded={open === id}
            aria-controls={panelId(id)}
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

      <div className={styles.lists}>
        {projectCategories.map(({ id }) => (
          <div
            key={id}
            id={panelId(id)}
            className={styles.panel}
            role="region"
            aria-labelledby={toggleId(id)}
            data-open={open === id ? "" : undefined}
            inert={open !== id}
          >
            <div className={styles.panelInner}>
              <ul className={styles.list}>
                {projectsInCategory(id).map((project) => (
                  <li key={project.slug} className={styles.item}>
                    <Link
                      className={styles.link}
                      href={`/projects/${project.slug}`}
                    >
                      /{project.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
