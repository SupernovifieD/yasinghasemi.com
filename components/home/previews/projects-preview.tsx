"use client";

import NextImage from "next/image";
import Link from "next/link";
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

function Tile({
  project,
  focusable,
}: {
  project: Project;
  focusable: boolean;
}) {
  return (
    <Link
      className={styles.tile}
      href={`/projects/${project.slug}`}
      aria-label={project.name}
      draggable={false}
      // The repeats that make the loop seamless, and the second band, are only
      // there for the eye: each project has one tab stop and one name for
      // assistive technology.
      tabIndex={focusable ? undefined : -1}
      aria-hidden={focusable ? undefined : true}
    >
      <NextImage
        className={styles.shot}
        src={projectShots[project.slug]}
        alt=""
        sizes="12rem"
        loading="eager"
        draggable={false}
      />
    </Link>
  );
}

function Band({
  order,
  direction,
  active,
  interactive,
}: {
  order: readonly Project[];
  direction: "up" | "down";
  active: boolean;
  /** Whether this band's first set takes part in keyboard navigation. */
  interactive: boolean;
}) {
  const repeats = Math.max(1, Math.ceil(MIN_SET_TILES / order.length));
  const set = Array.from({ length: repeats }, () => order).flat();
  const trackRef = useRef<HTMLDivElement>(null);
  const controller = useRef<ReturnType<typeof createRateController> | null>(
    null,
  );
  // The band crawls while the pointer is over it or a tile has focus.
  const slowedBy = useRef({ pointer: false, focus: false });

  function slow(change: Partial<typeof slowedBy.current>) {
    slowedBy.current = { ...slowedBy.current, ...change };
    const { pointer, focus } = slowedBy.current;
    controller.current?.setTarget(pointer || focus ? HOVER_RATE : 1);
  }

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
    if (active) return;
    slowedBy.current = { pointer: false, focus: false };
    controller.current?.setTarget(1);
  }, [active]);

  return (
    <div
      className={styles.band}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") slow({ pointer: true });
      }}
      onPointerLeave={() => slow({ pointer: false })}
      onFocusCapture={() => slow({ focus: true })}
      onBlurCapture={() => slow({ focus: false })}
    >
      <div
        ref={trackRef}
        className={styles.track}
        data-direction={direction}
        // Scroll speed stays constant however many projects there are.
        style={{ "--set-tiles": set.length } as CSSProperties}
      >
        {[...set, ...set].map((project, index) => (
          <Tile
            key={`${project.slug}-${index}`}
            project={project}
            focusable={interactive && index < order.length}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Two opposing, seamlessly looping bands of small project screenshots. Each
 * screenshot links to its project page; the same pages are listed on /projects.
 */
export default function ProjectsPreview({ active }: PreviewProps) {
  return (
    <div className={styles.bands} data-paused={active ? undefined : ""}>
      <Band order={showcased} direction="up" active={active} interactive />
      <Band
        order={rotate(showcased, Math.floor(showcased.length / 2))}
        direction="down"
        active={active}
        interactive={false}
      />
    </div>
  );
}
