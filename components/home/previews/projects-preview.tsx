"use client";

import NextImage from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";

import {
  createRateController,
  HOVER_RATE,
} from "@/components/home/previews/band-speed";
import { projectShots } from "@/components/projects/project-shots";
import styles from "@/components/home/previews/projects-preview.module.css";
import type { PreviewProps } from "@/components/home/previews/types";
import { projects, type Project } from "@/lib/projects";

// A set must be taller than the visible band, so short project lists are
// repeated up to this many tiles. The track holds two sets and loops by
// moving exactly one set.
const MIN_SET_TILES = 6;

/** Warm the browser cache for the preview's images ahead of the first hover. */
export function preloadProjectImages() {
  for (const { src } of Object.values(projectShots)) {
    const image = new Image();
    image.src = src;
  }
}

function rotate<T>(items: readonly T[], by: number) {
  return [...items.slice(by), ...items.slice(0, by)];
}

// Only projects with a screenshot are shown. One without a website yet
// (Karmania) keeps its place on /projects but stays out of this preview.
const showcased = projects.filter(({ slug }) => slug in projectShots);

function Tile({ project }: { project: Project }) {
  return (
    <div className={styles.tile}>
      <NextImage
        className={styles.shot}
        src={projectShots[project.slug]}
        alt=""
        sizes="12rem"
        loading="eager"
        draggable={false}
      />
    </div>
  );
}

function Band({
  order,
  direction,
  active,
}: {
  order: readonly Project[];
  direction: "up" | "down";
  active: boolean;
}) {
  const repeats = Math.max(1, Math.ceil(MIN_SET_TILES / order.length));
  const set = Array.from({ length: repeats }, () => order).flat();
  const trackRef = useRef<HTMLDivElement>(null);
  const controller = useRef<ReturnType<typeof createRateController> | null>(
    null,
  );

  useEffect(() => {
    const rate = createRateController(() => trackRef.current);
    controller.current = rate;
    return () => {
      rate.cancel();
      controller.current = null;
    };
  }, []);

  // A band that is no longer on show must not stay slowed down.
  useEffect(() => {
    if (!active) controller.current?.setTarget(1);
  }, [active]);

  return (
    <div
      className={styles.band}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") {
          controller.current?.setTarget(HOVER_RATE);
        }
      }}
      onPointerLeave={() => controller.current?.setTarget(1)}
    >
      <div
        ref={trackRef}
        className={styles.track}
        data-direction={direction}
        // Scroll speed stays constant however many projects there are.
        style={{ "--set-tiles": set.length } as CSSProperties}
      >
        {[...set, ...set].map((project, index) => (
          <Tile key={`${project.slug}-${index}`} project={project} />
        ))}
      </div>
    </div>
  );
}

/**
 * Two opposing, seamlessly looping bands of small project screenshots. Purely
 * decorative: the projects themselves are reachable through /projects.
 */
export default function ProjectsPreview({ active }: PreviewProps) {
  return (
    <div
      className={styles.bands}
      data-paused={active ? undefined : ""}
      aria-hidden="true"
    >
      <Band order={showcased} direction="up" active={active} />
      <Band
        order={rotate(showcased, Math.floor(showcased.length / 2))}
        direction="down"
        active={active}
      />
    </div>
  );
}
