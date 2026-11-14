import type { Metadata } from "next";

import { ProjectBrowser } from "@/components/projects/project-browser";
import { createPageMetadata } from "@/lib/metadata";

import styles from "./projects.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Projects",
  description: "Products Yasin Ghasemi has helped take from idea to reality.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <main id="main-content" className={styles.projects} tabIndex={-1}>
      <div className={styles.heading}>
        <h1>/projects</h1>
        <p className={styles.subtitle}>
          Here are some products I&apos;ve helped take from idea to reality.
        </p>
      </div>
      <ProjectBrowser />
    </main>
  );
}
