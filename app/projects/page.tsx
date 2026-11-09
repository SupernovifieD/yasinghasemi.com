import type { Metadata } from "next";

import { ProjectBrowser } from "@/components/projects/project-browser";
import { createPageMetadata } from "@/lib/metadata";

import styles from "./projects.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Projects",
  description: "Software and web development projects by Yasin Ghasemi.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <main id="main-content" className={styles.projects} tabIndex={-1}>
      <header className={styles.heading}>
        <h1>/projects</h1>
        <p className={styles.subtitle}>
          I do software and web development. Here is some of what I&apos;ve
          built.
        </p>
      </header>
      <ProjectBrowser />
    </main>
  );
}
