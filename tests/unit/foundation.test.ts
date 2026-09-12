import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/site-config";

describe("project foundation", () => {
  it("uses the canonical public origin", () => {
    expect(new URL(siteConfig.origin).origin).toBe(siteConfig.origin);
  });

  it("preserves the requested email display and link values", () => {
    expect(siteConfig.email).toEqual({
      label: "y@yasinghasemi.com",
      href: "mailto:y@yasinassemi.com",
    });
  });
});
