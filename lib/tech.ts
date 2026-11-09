import {
  siAstro,
  siDjango,
  siEtsy,
  siModelcontextprotocol,
  siNginx,
  siNodedotjs,
  siNextdotjs,
  siNpm,
  siPhp,
  siPostgresql,
  siPython,
  siRedis,
  siRust,
  siTypescript,
  siWordpress,
  type SimpleIcon,
} from "simple-icons";

import { readableOnBlack } from "@/lib/color";

export type TechId =
  | "astro"
  | "django"
  | "etsy"
  | "mcp"
  | "mkdocs"
  | "nextjs"
  | "nginx"
  | "nodejs"
  | "npm"
  | "php"
  | "postgresql"
  | "python"
  | "redis"
  | "rust"
  | "typescript"
  | "wordpress";

export type Tech = {
  id: TechId;
  label: string;
  /** Logo outline in a 24 x 24 box, or null when there is no logo (text only). */
  icon: string | null;
  /** A color that reads on the black page, or null for a text-only entry. */
  color: string | null;
};

/**
 * Brand colors that are black or very dark vanish on the page, so they get a
 * high-contrast alternative: white for the black logos, and Django's lighter
 * brand green for its dark one. Every other brand color is kept as it is; the
 * unit tests enforce the contrast of the result.
 */
const COLOR_OVERRIDES: Partial<Record<TechId, string>> = {
  django: "#44b78b",
  mcp: "#ffffff",
  nextjs: "#ffffff",
  rust: "#ffffff",
};

function logo(id: TechId, label: string, icon: SimpleIcon): Tech {
  return {
    id,
    label,
    icon: icon.path,
    color: COLOR_OVERRIDES[id] ?? readableOnBlack(`#${icon.hex}`),
  };
}

const catalog = [
  logo("astro", "Astro", siAstro),
  logo("django", "Django", siDjango),
  logo("etsy", "Etsy", siEtsy),
  logo("mcp", "MCP", siModelcontextprotocol),
  // Simple Icons has no plain MkDocs logo (only "Material for MkDocs", a
  // different product), so it is shown as text.
  { id: "mkdocs", label: "MkDocs", icon: null, color: null },
  logo("nextjs", "Next.js", siNextdotjs),
  logo("nginx", "Nginx", siNginx),
  logo("nodejs", "Node.js", siNodedotjs),
  logo("npm", "npm", siNpm),
  logo("php", "PHP", siPhp),
  logo("postgresql", "PostgreSQL", siPostgresql),
  logo("python", "Python", siPython),
  logo("redis", "Redis", siRedis),
  logo("rust", "Rust", siRust),
  logo("typescript", "TypeScript", siTypescript),
  logo("wordpress", "WordPress", siWordpress),
] satisfies Tech[];

export const techCatalog: Readonly<Record<TechId, Tech>> = Object.fromEntries(
  catalog.map((tech) => [tech.id, tech]),
) as Record<TechId, Tech>;

export function getTech(id: TechId): Tech {
  return techCatalog[id];
}
