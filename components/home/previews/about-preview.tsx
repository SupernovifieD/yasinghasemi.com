"use client";

import { useEffect, useRef, useState } from "react";

import {
  createPortraitRenderer,
  loadPortraitSource,
  type PortraitRenderer,
} from "@/components/home/previews/ascii-portrait";
import styles from "@/components/home/previews/about-preview.module.css";
import type { PreviewProps } from "@/components/home/previews/types";
import portrait from "@/assets/portrait/portrait.webp";

/** Warm the browser cache for the portrait ahead of the first hover. */
export function preloadPortrait() {
  const image = new Image();
  image.src = portrait.src;
}

/**
 * The portrait as dense ASCII on a canvas. Pointing at it pushes the glyphs
 * away like a repelling magnet; they spring back when the pointer leaves.
 */
export default function AboutPreview({ active }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PortraitRenderer | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let observer: ResizeObserver | undefined;

    async function start(target: HTMLCanvasElement) {
      const fontFamily = getComputedStyle(target).fontFamily;
      const [source] = await Promise.all([
        loadPortraitSource(portrait.src),
        document.fonts.load(`500 48px ${fontFamily}`),
      ]);
      if (cancelled) return;

      const renderer = createPortraitRenderer({
        canvas: target,
        source,
        fontFamily,
        interactive: !window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches,
      });
      rendererRef.current = renderer;

      // Observing fires once straight away, which draws the first frame.
      observer = new ResizeObserver(() => renderer.resize());
      observer.observe(target);
      setReady(true);
    }

    void start(canvas);

    return () => {
      cancelled = true;
      observer?.disconnect();
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.setActive(active);
  }, [active, ready]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      data-ready={ready ? "" : undefined}
      role="img"
      aria-label="ASCII portrait of Yasin Ghasemi"
    />
  );
}
