"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { BootstrapIcon } from "@/components/icons/bootstrap-icon";
import type { BootstrapGlyphName } from "@/components/icons/bootstrap-icons";
import styles from "@/components/projects/project-browser.module.css";
import { useActiveItem } from "@/components/projects/use-active-item";
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
  const { active, enter, leave, reset } = useActiveItem();
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
            onClick={() => {
              reset();
              setOpen((current) => (current === id ? null : id));
            }}
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
                {projectsInCategory(id).map((project) => {
                  const descriptionId = `${uid}-description-${project.slug}`;

                  return (
                    <li
                      key={project.slug}
                      className={styles.item}
                      data-active={active === project.slug ? "" : undefined}
                      onPointerEnter={(event) => {
                        if (event.pointerType !== "touch") enter(project.slug);
                      }}
                      onPointerLeave={leave}
                    >
                      <Link
                        className={styles.link}
                        href={`/projects/${project.slug}`}
                        aria-describedby={descriptionId}
                        onFocus={() => enter(project.slug, { immediate: true })}
                        onBlur={leave}
                      >
                        /{project.name}
                        {project.status ? (
                          <span className={styles.badge}>
                            <span aria-hidden="true">WIP</span>
                            <span className={styles.srOnly}>
                              {" "}
                              (work in progress)
                            </span>
                          </span>
                        ) : null}
                      </Link>
                      <div className={styles.description}>
                        <div className={styles.descriptionInner}>
                          <span
                            id={descriptionId}
                            className={styles.descriptionText}
                          >
                            {project.tagline}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
