export type Project = {
  slug: string;
  name: string;
  url: string;
};

/**
 * Single source for the projects shown on the site. A project's screenshot, if
 * it has one, is registered in components/home/previews/project-shots.ts;
 * projects without one render a neutral placeholder tile.
 */
export const projects: readonly Project[] = [
  { slug: "blulexi", name: "BluLexi", url: "https://blulexi.com" },
  {
    slug: "ec",
    name: "EarthCatalogue",
    url: "https://ec.yasinghasemi.com",
  },
  { slug: "samraarts", name: "Samra Arts", url: "https://samraarts.com" },
  {
    slug: "naar",
    name: "NAAR",
    url: "https://supernovified.github.io/naar/",
  },
  { slug: "amasghari", name: "Amasghari", url: "https://amasghari.com" },
  {
    slug: "birlikkalkinma",
    name: "Birlik Kalkınma",
    url: "https://birlikkalkinma.com.tr/",
  },
];
