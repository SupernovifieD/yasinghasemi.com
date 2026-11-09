"use client";

import type { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "@/components/portrait/ascii-portrait-canvas.module.css";
import {
  createPortraitRenderer,
  loadPortraitSource,
  type PortraitRenderer,
} from "@/components/portrait/ascii-portrait";

/**
 * A prepared portrait (see scripts/prepare-portrait.ts) drawn as dense ASCII
 * on a canvas. Fills its positioned parent. Pointing at it pushes the glyphs
 * away like a repelling magnet; they spring back when the pointer leaves.
 * `active` lets a host that hides the portrait release the pointer.
 */
export function AsciiPortraitCanvas({
  image,
  label,
  active = true,
}: {
  image: StaticImageData;
  label: string;
  active?: boolean;
}) {
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
        loadPortraitSource(image.src),
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
  }, [image.src]);

  useEffect(() => {
    rendererRef.current?.setActive(active);
  }, [active, ready]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      data-ready={ready ? "" : undefined}
      role="img"
      aria-label={label}
    />
  );
}
