import { useCallback, useEffect, useRef, useState } from "react";

import { HOVER_PREVIEW_QUERY } from "@/lib/layout";

/** Rest on an item this long before its details open from a closed list. */
const ENTER_DELAY_MS = 90;
/** Linger this long after leaving, so crossing the gap between items is calm. */
const LEAVE_DELAY_MS = 140;

/**
 * Which list item is showing its hover details, with hover intent: opening
 * from nothing waits a moment, moving to a neighbour switches at once, and
 * leaving closes after a short delay (cancelled by entering another item).
 * Only fine-pointer desktops use it; touch and narrow screens never activate
 * an item, because they show every description inline instead.
 */
export function useActiveItem() {
  const [active, setActive] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const timer = useRef(0);

  const commit = useCallback((slug: string | null) => {
    activeRef.current = slug;
    setActive(slug);
  }, []);

  const cancel = useCallback(() => window.clearTimeout(timer.current), []);

  const enter = useCallback(
    (slug: string, { immediate = false } = {}) => {
      if (!window.matchMedia(HOVER_PREVIEW_QUERY).matches) return;

      cancel();
      if (immediate || activeRef.current !== null) {
        commit(slug);
      } else {
        timer.current = window.setTimeout(() => commit(slug), ENTER_DELAY_MS);
      }
    },
    [cancel, commit],
  );

  const leave = useCallback(() => {
    cancel();
    timer.current = window.setTimeout(() => commit(null), LEAVE_DELAY_MS);
  }, [cancel, commit]);

  const reset = useCallback(() => {
    cancel();
    commit(null);
  }, [cancel, commit]);

  useEffect(() => cancel, [cancel]);

  return { active, enter, leave, reset };
}
