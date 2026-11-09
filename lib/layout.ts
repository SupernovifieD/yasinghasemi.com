/**
 * Viewports at or above this width get the desktop header and the two-column
 * home page. Keep in sync with the `min-width: 64rem` rules in
 * components/site-shell.module.css and components/home/home-stage.module.css
 * (CSS cannot import this constant).
 */
export const DESKTOP_QUERY = "(min-width: 64rem)";

/** Hover previews additionally need a hover-capable fine pointer, never touch. */
export const HOVER_PREVIEW_QUERY = `${DESKTOP_QUERY} and (hover: hover) and (pointer: fine)`;
