import { describe, expect, it } from "vitest";

import {
  getProject,
  projectCategories,
  projects,
  projectsInCategory,
} from "@/lib/projects";
import { techCatalog } from "@/lib/tech";

const names = (category: "software" | "web") =>
  projectsInCategory(category).map(({ name }) => name);

describe("projects data", () => {
  it("lists the requested projects, per category, in the requested order", () => {
    expect(names("software")).toEqual([
      "BluLexi",
      "EarthCatalogue",
      "Naar",
      "MinexPy",
      "Karmania Map Viewer",
    ]);
    expect(names("web")).toEqual([
      "samiraarts.com",
      "amasghari.com",
      "maham-iot.ir",
      "Birlik's website",
    ]);
  });

  it("uses exactly the requested slugs", () => {
    expect(projects.map(({ slug }) => slug).toSorted()).toEqual(
      [
        "amasghari",
        "birlik",
        "blulexi",
        "earthcatalogue",
        "karmania",
        "maham-iot",
        "minexpy",
        "naar",
        "samiraarts",
      ].toSorted(),
    );
  });

  it("has unique slugs usable in URLs and as screenshot file names", () => {
    const slugs = projects.map(({ slug }) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("puts every project in a known category", () => {
    const known = new Set(projectCategories.map(({ id }) => id));
    for (const { category, slug } of projects) {
      expect(known.has(category), slug).toBe(true);
    }
  });

  it("only uses technologies that exist in the catalog", () => {
    for (const { tech, slug } of projects) {
      expect(tech.length, slug).toBeGreaterThan(0);
      expect(new Set(tech).size, slug).toBe(tech.length);
      for (const id of tech)
        expect(techCatalog[id], `${slug}: ${id}`).toBeDefined();
    }
  });

  it("gives each project a one-line tagline and a meta-description-sized summary", () => {
    for (const { tagline, summary, slug } of projects) {
      expect(tagline, slug).not.toMatch(/\n/);
      expect(tagline.length, slug).toBeLessThanOrEqual(90);
      expect(summary.length, slug).toBeGreaterThan(40);
      expect(summary.length, slug).toBeLessThanOrEqual(170);
    }
  });

  it("has real sections and clean text", () => {
    for (const { sections, slug } of projects) {
      expect(sections.length, slug).toBeGreaterThan(0);
      for (const { heading, paragraphs } of sections) {
        expect(heading.trim(), slug).not.toBe("");
        expect(paragraphs.length, slug).toBeGreaterThan(0);
        for (const paragraph of paragraphs) {
          expect(paragraph, slug).toBe(paragraph.trim());
          expect(paragraph, slug).not.toMatch(/ {2}|TODO/);
          expect(paragraph.length, slug).toBeGreaterThan(20);
        }
      }
    }
  });

  it("links every project over https", () => {
    for (const { url, links, slug } of projects) {
      for (const href of [...(url ? [url] : []), ...links.map((l) => l.href)]) {
        expect(new URL(href).protocol, `${slug} ${href}`).toBe("https:");
      }
      for (const link of links) expect(link.label.trim(), slug).not.toBe("");
    }
  });

  it("marks only Karmania as a work in progress, with its launch note", () => {
    const wip = projects.filter(({ status }) => status);
    expect(wip.map(({ slug }) => slug)).toEqual(["karmania"]);
    expect(getProject("karmania")).toMatchObject({
      status: { kind: "wip", note: "Launching late November 2026" },
    });
    expect(getProject("karmania")?.url).toBeUndefined();
    expect(getProject("karmania")?.links.length).toBeGreaterThan(0);
  });

  it("finds a project by slug", () => {
    expect(getProject("naar")?.name).toBe("Naar");
    expect(getProject("nope")).toBeUndefined();
  });
});
