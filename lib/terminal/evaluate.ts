import { resolvePublicPath } from "@/lib/terminal/resolve-path";
import {
  listPublicChildren,
  type PublicRouteRegistry,
} from "@/lib/terminal/routes";

export type TerminalOutputLine = {
  text: string;
  href?: string;
};

export type TerminalEvaluation =
  | { kind: "output"; lines: TerminalOutputLine[] }
  | {
      kind: "navigate";
      href: string;
      changed: boolean;
      lines: TerminalOutputLine[];
    }
  | { kind: "error"; message: string };

function usage(command: "pwd" | "ls" | "help") {
  const syntax = {
    pwd: "pwd",
    ls: "ls [path]",
    help: "help",
  }[command];
  return { kind: "error", message: `usage: ${syntax}` } as const;
}

export function evaluateCdCommand(
  tokens: string[],
  cwd: string,
  previousDirectory: string | null,
  registry: PublicRouteRegistry,
): TerminalEvaluation | null {
  const [command, ...args] = tokens;
  if (command !== "cd") return null;
  if (args.length > 1) {
    return { kind: "error", message: "usage: cd [path]" };
  }
  if (args[0]?.startsWith("-") && args[0] !== "-") {
    return { kind: "error", message: "cd: flags are not supported" };
  }

  if (args[0] === "-") {
    if (!previousDirectory) {
      return { kind: "error", message: "cd: previous directory not set" };
    }
    return {
      kind: "navigate",
      href: previousDirectory,
      changed: previousDirectory !== cwd,
      lines: [{ text: previousDirectory }],
    };
  }

  if (args[0] === "") {
    return { kind: "error", message: "cd: no such directory" };
  }

  const target = args[0] ?? "/";
  const resolution = resolvePublicPath(registry, cwd, target);
  if (!resolution.ok) {
    const suggestion =
      !target.includes("/") &&
      registry.paths.includes(`/${target}`) &&
      cwd !== "/"
        ? ` Try cd /${target}.`
        : "";
    return {
      kind: "error",
      message: `cd: ${resolution.message}.${suggestion}`,
    };
  }

  return {
    kind: "navigate",
    href: resolution.path,
    changed: resolution.changed,
    lines: [],
  };
}

export function evaluateInformationCommand(
  tokens: string[],
  cwd: string,
  registry: PublicRouteRegistry,
): TerminalEvaluation | null {
  const [command, ...args] = tokens;

  if (command === "pwd") {
    if (args.length) return usage("pwd");
    return { kind: "output", lines: [{ text: cwd }] };
  }

  if (command === "ls") {
    if (args.length > 1) return usage("ls");
    if (args[0]?.startsWith("-")) {
      return { kind: "error", message: "ls: flags are not supported" };
    }

    const target = args[0] ?? ".";
    const resolution = resolvePublicPath(registry, cwd, target);
    if (!resolution.ok) {
      return { kind: "error", message: `ls: ${resolution.message}` };
    }

    const children = listPublicChildren(registry, resolution.path);
    return {
      kind: "output",
      lines: (children ?? []).map(({ label, href }) => ({ text: label, href })),
    };
  }

  if (command === "help") {
    if (args.length) return usage("help");
    return {
      kind: "output",
      lines: [
        { text: "This is a navigation shell, not a server terminal." },
        { text: "cd [path]  move among public website routes" },
        { text: "pwd        print the current website path" },
        { text: "ls [path]  list immediate public child routes" },
        { text: "clear      clear terminal output" },
        { text: "help       show this help" },
        { text: "Examples: cd blog, cd /blog, cd ../blog, cd -" },
        {
          text: "cd blog is relative to the current path; cd /blog is absolute.",
        },
      ],
    };
  }

  return null;
}
