export type LegacyPostSource = {
  sourcePath: string;
  title: string;
  publishedAt: string;
  excerpt: string;
  slug: string;
  oldHashPath: string;
};

export const legacyPostSources = [
  {
    sourcePath: "mydocuments/0-thebeginning/howitcametobe.html",
    title: "The Story of This Blog, aka The Beginning",
    publishedAt: "2026-05-06",
    excerpt:
      "How a static Windows 98-style personal site became the new home for my writing.",
    slug: "the-story-of-this-blog",
    oldHashPath: "/docs/0-thebeginning",
  },
  {
    sourcePath: "mydocuments/1-NetRadar/1-howitstarted/howitstarted.html",
    title: "How NetRadar Was Started",
    publishedAt: "2026-05-09",
    excerpt:
      "Building an open-source service availability tool during a fragile internet blackout.",
    slug: "how-netradar-was-started",
    oldHashPath: "/docs/1-NetRadar/1-howitstarted",
  },
  {
    sourcePath: "mydocuments/2-MineralProspectivityMapping/why/why.html",
    title:
      "Why Did I Start Working on a Mineral Prospectivity Mapping Project?",
    publishedAt: "2026-05-12",
    excerpt:
      "Returning to mineral prospectivity mapping through Python, machine learning, and unfinished thesis ambitions.",
    slug: "why-i-started-mineral-prospectivity-mapping",
    oldHashPath: "/docs/2-MineralProspectivityMapping/why",
  },
  {
    sourcePath:
      "mydocuments/2-MineralProspectivityMapping/May-20/mpm-and-its-challenges.html",
    title: "When MPM Becomes a Decision Marathon",
    publishedAt: "2026-05-20",
    excerpt:
      "Feature engineering in MPM is stretching my compute, my workflow, and my ability to make the right decisions at every step.",
    slug: "when-mpm-becomes-a-decision-marathon",
    oldHashPath: "/docs/2-MineralProspectivityMapping/May-20",
  },
  {
    sourcePath: "mydocuments/Journal/06-09-2026/a-bit-of-bordom.html",
    title: "Three Fast Weeks and a First Taste of Paid Programming",
    publishedAt: "2026-06-09",
    excerpt:
      "A catch-up after three fast weeks of building Naar, joining DDero, and earning money from programming for the first time.",
    slug: "three-fast-weeks-and-a-first-taste-of-paid-programming",
    oldHashPath: "/docs/Journal/06-09-2026",
  },
] as const satisfies readonly LegacyPostSource[];
