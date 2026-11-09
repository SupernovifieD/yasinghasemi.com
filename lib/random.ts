/** A random index in `[0, length)`. `random` is injectable for tests. */
export function pickRandomIndex(length: number, random = Math.random) {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError("pickRandomIndex needs a positive integer length");
  }
  return Math.min(length - 1, Math.floor(random() * length));
}
