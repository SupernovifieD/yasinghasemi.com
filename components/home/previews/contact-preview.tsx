"use client";

import { useEffect, useRef, useState } from "react";

import { contactLogos } from "@/components/home/previews/contact-logos";
import styles from "@/components/home/previews/contact-preview.module.css";
import type { ContactScene } from "@/components/home/previews/contact-scene";
import type { PreviewProps } from "@/components/home/previews/types";

type Mode = "loading" | "webgl" | "flat";

/**
 * Three floating 3D logos (GitHub, email, LinkedIn). The links are ordinary
 * anchors that the scene keeps positioned over each logo, so they are real,
 * focusable links. three.js is imported only when this preview first mounts.
 * Without WebGL the same anchors show flat icons instead.
 */
export default function ContactPreview({ active }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const anchorRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const sceneRef = useRef<ContactScene | null>(null);
  const [mode, setMode] = useState<Mode>("loading");

  useEffect(() => {
    const canvas = canvasRef.current;
    const anchors = anchorRefs.current.filter(
      (anchor): anchor is HTMLAnchorElement => anchor !== null,
    );
    if (!canvas || anchors.length !== contactLogos.length) return;

    let cancelled = false;
    let observer: ResizeObserver | undefined;

    async function start(target: HTMLCanvasElement) {
      try {
        const { createContactScene } =
          await import("@/components/home/previews/contact-scene");
        if (cancelled) return;

        const scene = createContactScene({
          canvas: target,
          logos: contactLogos,
          anchors,
          animate: !window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches,
        });
        if (!scene) {
          setMode("flat");
          return;
        }

        sceneRef.current = scene;
        // Observing fires once straight away, which sizes and draws the scene.
        observer = new ResizeObserver(() => scene.resize());
        observer.observe(target);
        setMode("webgl");
      } catch {
        // The chunk failed to load: the flat icons still work.
        if (!cancelled) setMode("flat");
      }
    }

    void start(canvas);

    return () => {
      cancelled = true;
      observer?.disconnect();
      sceneRef.current?.destroy();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.setActive(active);
  }, [active, mode]);

  return (
    <div className={styles.root} data-mode={mode}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      {contactLogos.map((logo, index) => {
        const external = logo.href.startsWith("http");

        return (
          <a
            key={logo.id}
            ref={(element) => {
              anchorRefs.current[index] = element;
            }}
            className={styles.anchor}
            data-logo={logo.id}
            href={logo.href}
            aria-label={logo.label}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <svg
              className={styles.flat}
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={logo.path} />
            </svg>
          </a>
        );
      })}
    </div>
  );
}
