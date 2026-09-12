import { describe, expect, it } from "vitest";

describe("project foundation", () => {
  it("uses the canonical public origin", () => {
    expect(new URL("https://yasinghasemi.com").origin).toBe(
      "https://yasinghasemi.com",
    );
  });
});
