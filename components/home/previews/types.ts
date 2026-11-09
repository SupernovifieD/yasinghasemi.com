import type { BlogPreviewPost } from "@/lib/posts/excerpt";

/**
 * Every preview stays mounted once first shown and receives `active` so it can
 * pause its animation, rendering, or timers while another preview is showing.
 */
export type PreviewProps = {
  active: boolean;
};

export type BlogPreviewProps = PreviewProps & {
  post: BlogPreviewPost | null;
};
