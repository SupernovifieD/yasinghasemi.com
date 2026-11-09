import { describe, expect, it } from "vitest";

import { contrastRatio, MIN_LOGO_CONTRAST, PAGE_BLACK } from "@/lib/color";
import { getTech, techCatalog, type TechId } from "@/lib/tech";

const all = Object.values(techCatalog);

describe("technology catalog", () => {
  it("has unique ids and labels", () => {
    expect(new Set(all.map(({ id }) => id)).size).toBe(all.length);
    expect(new Set(all.map(({ label }) => label)).size).toBe(all.length);
  });

  it("gives every logo a path and a color that reads on the black page", () => {
    for (const tech of all) {
      if (tech.icon === null) continue;
      expect(tech.icon.startsWith("M"), tech.id).toBe(true);
      expect(tech.color, tech.id).toMatch(/^#[0-9a-f]{6}$/);
      expect(
        contrastRatio(tech.color as string, PAGE_BLACK),
        `${tech.id} ${tech.color}`,
      ).toBeGreaterThanOrEqual(MIN_LOGO_CONTRAST);
    }
  });

  it("swaps the black and very dark brand colors for readable ones", () => {
    for (const id of ["nextjs", "rust", "mcp"] as TechId[]) {
      expect(getTech(id).color).toBe("#ffffff");
    }
    expect(getTech("django").color).toBe("#44b78b");
  });

  it("keeps real brand colors where they already have contrast", () => {
    expect(getTech("postgresql").color).toBe("#4169e1");
    expect(getTech("typescript").color).toBe("#3178c6");
    expect(getTech("redis").color).toBe("#ff4438");
  });

  it("shows MkDocs as text because there is no plain MkDocs logo", () => {
    expect(getTech("mkdocs")).toMatchObject({
      label: "MkDocs",
      icon: null,
      color: null,
    });
  });
});
