/**
 * The `count` items that follow the one at `index`, wrapping around the end of
 * the list. It never includes the item itself, so a list of two gives one
 * result. Nothing is random (the site is built once), yet the picks differ from
 * page to page and every item turns up on other pages.
 */
export function itemsAfter<T>(
  items: readonly T[],
  index: number,
  count = 3,
): T[] {
  if (!Number.isInteger(index) || index < 0 || index >= items.length) return [];

  const length = Math.min(count, items.length - 1);
  return Array.from(
    { length },
    (_, offset) => items[(index + 1 + offset) % items.length],
  );
}
