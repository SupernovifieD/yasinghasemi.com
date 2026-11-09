import {
  bootstrapGlyphs,
  type BootstrapGlyphName,
} from "@/components/icons/bootstrap-icons";

/** A decorative Bootstrap Icons glyph, drawn in the current text color. */
export function BootstrapIcon({
  name,
  className,
}: {
  name: BootstrapGlyphName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={bootstrapGlyphs[name]} />
    </svg>
  );
}
