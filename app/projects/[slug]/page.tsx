import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { KeepReading } from "@/components/keep-reading";
import { projectShots } from "@/components/projects/project-shots";
import { ReadingLayout } from "@/components/reading-layout";
import { TechRow } from "@/components/projects/tech-row";
import { createPageMetadata } from "@/lib/metadata";
import { getProject, projects, relatedProjects } from "@/lib/projects";

import styles from "./project.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const metadata = createPageMetadata({
    title: project.name,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
  const shot = projectShots[project.slug];
  if (!shot) return metadata;

  const image = {
    url: shot.src,
    width: shot.width,
    height: shot.height,
    alt: `Screenshot of ${project.name}`,
  };

  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, images: [image] },
    twitter: {
      ...metadata.twitter,
      card: "summary_large_image",
      images: [image],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  return (
    <ReadingLayout>
      <article>
        <BackLink href="/projects">Back to /projects</BackLink>
        <h1>{project.name}</h1>
        <div className={styles.tech}>
          <TechRow tech={project.tech} />
        </div>
        {project.status ? (
          <p className={styles.notice} role="note">
            <strong>Work in progress.</strong> {project.status.note}.
          </p>
        ) : null}
        {project.sections.map(({ heading, paragraphs }) => (
          <section key={heading}>
            <h2>{heading}</h2>
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
        {project.url || project.links.length > 0 ? (
          <div className={styles.links}>
            {project.url ? (
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                {project.urlLabel ?? "Visit the website"}{" "}
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
            {project.links.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        ) : null}
      </article>
      <KeepReading
        heading="More projects"
        items={relatedProjects(project.slug).map(({ slug, name, tagline }) => ({
          href: `/projects/${slug}`,
          title: name,
          description: tagline,
        }))}
      />
    </ReadingLayout>
  );
}
