import type { TechId } from "@/lib/tech";

export type ProjectCategory = "software" | "web";

export const projectCategories: readonly {
  id: ProjectCategory;
  label: string;
}[] = [
  { id: "software", label: "Software & Apps" },
  { id: "web", label: "Web Development" },
];

export type ProjectLink = { label: string; href: string };

export type ProjectSection = {
  heading: string;
  paragraphs: readonly string[];
};

export type Project = {
  /** URL segment of /projects/<slug>, and the key of its screenshot. */
  slug: string;
  /** The label shown in lists and as the page title. */
  name: string;
  category: ProjectCategory;
  /** One short line, shown on hover. */
  tagline: string;
  /** The page's meta description. */
  summary: string;
  tech: readonly TechId[];
  sections: readonly ProjectSection[];
  /** The live website, when there is one. */
  url?: string;
  /** Text of the link to `url` (default: "Visit the website"). */
  urlLabel?: string;
  /** Other places to find it: documentation, package, source. */
  links: readonly ProjectLink[];
  /** Set while a project is not launched yet. */
  status?: { kind: "wip"; note: string };
};

/**
 * Single source for everything about a project: the lists, the hover lines,
 * the page text, and the technology row all come from this array. To add a
 * project, add an entry here and, if it has a website, a screenshot (see
 * docs/publishing.md). List order is display order within each category.
 */
export const projects: readonly Project[] = [
  {
    slug: "blulexi",
    name: "BluLexi",
    category: "software",
    tagline: "An AI SaaS for language test prep.",
    summary:
      "BluLexi is an AI SaaS for language test prep. I built it myself, from the first idea and the architecture to deployment and feedback from real users.",
    tech: ["django", "postgresql", "nextjs", "wordpress", "redis", "nginx"],
    url: "https://blulexi.com",
    links: [],
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "BluLexi is an AI SaaS for language test prep. I started it in 2023 and built the whole product myself, from ideation, prototyping and architecture design to development, deployment and collecting feedback from real users.",
          "It has gone through several iterations, and the current version is built entirely by me from scratch.",
        ],
      },
      {
        heading: "My role",
        paragraphs: [
          "At first I handled the architecture and the business development. As the project went on, I took on the developer role too. In earlier iterations I worked with two developers.",
        ],
      },
      {
        heading: "Where it stands",
        paragraphs: [
          "BluLexi is still a work in progress, but not in development: the work now is marketing and finding real users.",
        ],
      },
      {
        heading: "What I learned",
        paragraphs: [
          "I learned how a whole pipeline and a real production web app work, and how to maintain a production-grade SaaS. That included caching with Redis, reverse proxying with Nginx, and back-end and front-end development.",
          "The one area I haven't touched is mobile development, which is the likely next step.",
        ],
      },
    ],
  },
  {
    slug: "earthcatalogue",
    name: "EarthCatalogue",
    category: "software",
    tagline: "Public geoscience data, with an MCP server.",
    summary:
      "EarthCatalogue is a directory of publicly available geoscientific data with an MCP server, built with Django, Next.js and PostgreSQL.",
    tech: ["django", "nextjs", "postgresql", "mcp"],
    url: "https://ec.yasinghasemi.com",
    links: [],
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "EarthCatalogue is a directory of publicly available geoscientific data, and it comes with an MCP server.",
        ],
      },
      {
        heading: "Where it stands",
        paragraphs: [
          "I published it in August 2026, and the MCP server is up and running. It is still a work in progress, because the amount of data is enormous and can't be added in one go.",
        ],
      },
      {
        heading: "What I learned",
        paragraphs: [
          "It helped me understand how an MCP server works and how to implement one. It also taught me database design best practices, since the site is essentially a directory of datasets from many providers.",
        ],
      },
    ],
  },
  {
    slug: "naar",
    name: "Naar",
    category: "software",
    tagline: "A CLI for checking agent skills for safety.",
    summary:
      "Naar is a CLI package manager for agent skills. It helps you check whether skills downloaded from around the web are safe.",
    tech: ["typescript", "nodejs", "npm", "astro"],
    url: "https://supernovified.github.io/naar/",
    links: [
      { label: "npm package", href: "https://www.npmjs.com/package/naar-cli" },
      {
        label: "Source on GitHub",
        href: "https://github.com/SupernovifieD/naar",
      },
    ],
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Naar is a CLI package manager for agent skills. It helps users moderate the skills they download from around the web, so they can check whether they are safe.",
        ],
      },
      {
        heading: "Where it stands",
        paragraphs: [
          "I published it in the summer of 2026. Version 1 is out, and version 2 is coming soon with improved performance and precision.",
        ],
      },
      {
        heading: "What I learned",
        paragraphs: [
          "I learned how to build a CLI with TypeScript, how the npm publishing pipeline works, and how to build the website with Astro.",
        ],
      },
    ],
  },
  {
    slug: "minexpy",
    name: "MinexPy",
    category: "software",
    tagline: "Python toolkit for mineral potential mapping.",
    summary:
      "MinexPy is a Python toolkit that turns geochemical assay values into a mineral potential map. It extends my master's research.",
    tech: ["python", "mkdocs"],
    url: "https://supernovified.github.io/MinexPy/",
    urlLabel: "Read the documentation",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/SupernovifieD/MinexPy",
      },
    ],
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "MinexPy is a Python toolkit for preliminary mineral potential mapping. It takes values from geochemical assays and turns them into a potential map, to find areas that could be favorable for future mineral exploration.",
        ],
      },
      {
        heading: "Where it came from",
        paragraphs: [
          "It extends my master's research, which I did in 2022, and I published it in early 2026.",
        ],
      },
      {
        heading: "What I learned",
        paragraphs: [
          "It was my first attempt at programming. It taught me how a Python library is packaged and published, and how documentation works with MkDocs.",
        ],
      },
    ],
  },
  {
    slug: "karmania",
    name: "Karmania Map Viewer",
    category: "software",
    tagline: "An online map viewer for geoscientific data.",
    summary:
      "Karmania Map Viewer is an online map viewer for geoscientific data, written in Rust and TypeScript. It is a work in progress, launching in late November 2026.",
    tech: ["rust", "typescript"],
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/SupernovifieD/karmania-map-viewer",
      },
    ],
    status: { kind: "wip", note: "Launching late November 2026" },
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Karmania Map Viewer is an online map viewer for geoscientific data. It lets researchers render their data on 2D or 3D maps and inspect it interactively in the browser.",
        ],
      },
      {
        heading: "Why I'm building it",
        paragraphs: [
          "It began as a way for me to learn Rust and its ecosystem.",
        ],
      },
      {
        heading: "Where it stands",
        paragraphs: [
          "It is a work in progress, and it launches in late November 2026.",
        ],
      },
    ],
  },
  {
    slug: "samiraarts",
    name: "samiraarts.com",
    category: "web",
    tagline: "An artist's portfolio website.",
    summary:
      "samiraarts.com is an artist's portfolio website built with Django, PostgreSQL, WordPress and Next.js, with her Etsy shop integrated.",
    tech: ["django", "postgresql", "wordpress", "nextjs", "etsy"],
    url: "https://samiraarts.com",
    links: [],
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "samiraarts.com is a portfolio website that I built for an artist. She had no programming experience at all, which made the collaboration a joy.",
        ],
      },
      {
        heading: "What I learned",
        paragraphs: [
          "I learned to bundle PostgreSQL, Django, WordPress and Next.js together. The artist also asked for new features, such as integrating her Etsy shop into the website, which made the project more interesting. It was a learning experience all the way.",
        ],
      },
    ],
  },
  {
    slug: "amasghari",
    name: "amasghari.com",
    category: "web",
    tagline: "A bilingual Persian and English website.",
    summary:
      "amasghari.com is a bilingual Persian and English website built with Next.js and WordPress. I was in charge of the front end.",
    tech: ["nextjs", "wordpress"],
    url: "https://amasghari.com",
    links: [],
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "amasghari.com is a team project. I was in charge of the front end: I built the Next.js app and the service layer between it and the WordPress back end.",
        ],
      },
      {
        heading: "The challenge",
        paragraphs: [
          "The most interesting challenge was that the site is bilingual, in Persian and English. English is left-to-right and Persian is right-to-left, so every element had to be checked in both languages, because the layout changes completely.",
          "It was my first time building a site with two different language layouts.",
        ],
      },
    ],
  },
  {
    slug: "maham-iot",
    name: "maham-iot.ir",
    category: "web",
    tagline: "A WordPress website I built alone.",
    summary:
      "maham-iot.ir is a WordPress website I developed fully by myself, from the architecture and development to deployment, graphic design and interface design.",
    tech: ["wordpress", "php"],
    url: "https://maham-iot.ir",
    links: [],
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "maham-iot.ir is a WordPress website that I developed fully by myself: the architecture, the development and the deployment, plus the graphic design, the overall layout and the user interface design.",
        ],
      },
      {
        heading: "What I learned",
        paragraphs: [
          "It was the first time I had built anything fully in WordPress and PHP, and it was a big challenge, since at first I didn't know how PHP and WordPress sites work.",
        ],
      },
    ],
  },
  {
    slug: "birlik",
    name: "birlikkalkinma.com.tr",
    category: "web",
    tagline: "A bilingual Next.js website.",
    summary:
      "birlikkalkinma.com.tr is a bilingual website that I implemented as a Next.js app, working with a group of designers.",
    tech: ["nextjs"],
    url: "https://birlikkalkinma.com.tr/",
    links: [],
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "I worked on this website with another group of designers. I was responsible for the overall architecture, but I didn't design the whole UX and UI. I implemented the front end as a Next.js app.",
        ],
      },
      {
        heading: "What I learned",
        paragraphs: [
          "What I had learned from amasghari.com helped me build this bilingual website much faster and more efficiently.",
        ],
      },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function projectsInCategory(category: ProjectCategory) {
  return projects.filter((project) => project.category === category);
}
