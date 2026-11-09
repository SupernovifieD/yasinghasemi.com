import portrait from "@/assets/portrait/portrait-about.webp";
import styles from "@/components/about/about-portrait.module.css";
import { AsciiPortraitCanvas } from "@/components/portrait/ascii-portrait-canvas";

/**
 * The portrait on the /about page: a second photo as pointer-reactive ASCII on
 * the same gray radial glow as the home previews. Fine pointers push the
 * glyphs around; touch screens and reduced motion get the still portrait.
 */
export function AboutPortrait() {
  return (
    <div className={styles.stage}>
      <div className={styles.glow} aria-hidden="true" />
      <AsciiPortraitCanvas
        image={portrait}
        label="ASCII portrait of Yasin Ghasemi"
      />
    </div>
  );
}
