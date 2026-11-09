/**
 * Run `task` when the browser is idle (or shortly after, where
 * `requestIdleCallback` is missing, e.g. Safari). Returns a canceller.
 */
export function whenIdle(task: () => void, timeout = 4000) {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(task, 1500);
  return () => window.clearTimeout(handle);
}
