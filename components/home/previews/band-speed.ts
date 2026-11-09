import { easeToward } from "@/lib/ease";

/** Speed of a hovered band relative to normal: very slow, still moving. */
export const HOVER_RATE = 0.1;

/** Seconds for the speed change to close ~63% of its gap. */
export const RATE_TAU = 0.35;

/**
 * Set a running CSS animation's speed without moving it. Changing
 * `animation-duration` mid-flight would make the band jump to a new point on
 * its loop; the Web Animations API keeps the current position.
 */
export function setAnimationRate(animation: Animation, rate: number) {
  if (typeof animation.updatePlaybackRate === "function") {
    animation.updatePlaybackRate(rate);
  } else {
    animation.playbackRate = rate;
  }
}

/**
 * Drive the first animation on `element` toward a target playback rate with
 * eased steps. Returns `setTarget(rate)`, which restarts the loop if needed,
 * and `cancel()`. A no-op when the element has no animation (reduced motion).
 */
export function createRateController(element: () => HTMLElement | null) {
  let rate = 1;
  let target = 1;
  let frame = 0;
  let last = 0;

  function step(now: number) {
    const animation = element()?.getAnimations()[0];
    if (!animation) {
      frame = 0;
      return;
    }

    rate = easeToward(rate, target, (now - last) / 1000, RATE_TAU);
    last = now;
    setAnimationRate(animation, rate);
    frame = rate === target ? 0 : requestAnimationFrame(step);
  }

  return {
    setTarget(next: number) {
      target = next;
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(step);
    },
    cancel() {
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}
