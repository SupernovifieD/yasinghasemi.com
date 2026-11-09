import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { projectShots } from "@/components/home/previews/project-shots";
import { projects } from "@/lib/projects";

const directory = join(process.cwd(), "assets", "projects");
const files = readdirSync(directory).filter((name) => name.endsWith(".webp"));

describe("project screenshots", () => {
  it("exist for every project that has a website, and only those", () => {
    const expected = projects
      .filter(({ url }) => url)
      .map(({ slug }) => slug)
      .toSorted();
    expect(Object.keys(projectShots).toSorted()).toEqual(expected);
  });

  it("have a file per registered slug and no orphan files", () => {
    expect(files.map((name) => name.replace(/\.webp$/, "")).toSorted()).toEqual(
      Object.keys(projectShots).toSorted(),
    );
  });

  it("are small optimized images", () => {
    for (const name of files) {
      expect(statSync(join(directory, name)).size, name).toBeLessThan(
        40 * 1024,
      );
    }
  });
});
