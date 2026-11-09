/**
 * Move `current` toward `target` by exponential smoothing: after `tau` seconds
 * about 63% of the gap is closed. Frame-rate independent, never overshoots,
 * and snaps to the target once within `epsilon` so a loop driving it can stop.
 */
export function easeToward(
  current: number,
  target: number,
  dt: number,
  tau: number,
  epsilon = 0.002,
) {
  if (dt <= 0) return current;

  const next = target + (current - target) * Math.exp(-dt / tau);
  return Math.abs(next - target) < epsilon ? target : next;
}
