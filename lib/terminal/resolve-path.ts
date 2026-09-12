import { isPublicPath, type PublicRouteRegistry } from "@/lib/terminal/routes";

export type PathResolution =
  { ok: true; path: string; changed: boolean } | { ok: false; message: string };

function parentPath(path: string) {
  if (path === "/") return "/";
  const separator = path.lastIndexOf("/");
  return separator <= 0 ? "/" : path.slice(0, separator);
}

function invalidPath(value: string) {
  return (
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("?") ||
    value.includes("#") ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    /^[a-z][a-z0-9+.-]*:/i.test(value)
  );
}

export function resolvePublicPath(
  registry: PublicRouteRegistry,
  cwd: string,
  input: string,
): PathResolution {
  let decoded: string;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    return { ok: false, message: "malformed path encoding" };
  }

  if (decoded.includes("%") || invalidPath(decoded)) {
    return { ok: false, message: "unsupported path" };
  }

  const homeExpanded =
    decoded === "~"
      ? "/"
      : decoded.startsWith("~/")
        ? decoded.slice(1)
        : decoded;
  const absolute = homeExpanded.startsWith("/");
  let current = absolute ? "/" : cwd;

  if (!absolute && !isPublicPath(registry, current)) {
    return { ok: false, message: "current directory is not public" };
  }

  for (const segment of homeExpanded.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      current = parentPath(current);
      continue;
    }

    const candidate = current === "/" ? `/${segment}` : `${current}/${segment}`;
    if (!isPublicPath(registry, candidate)) {
      return { ok: false, message: `no such directory: ${candidate}` };
    }
    current = candidate;
  }

  if (!isPublicPath(registry, current)) {
    return { ok: false, message: `no such directory: ${current}` };
  }

  return { ok: true, path: current, changed: current !== cwd };
}
