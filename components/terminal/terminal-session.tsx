"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";

import { SiteNavigation } from "@/components/site-navigation";
import styles from "@/components/site-shell.module.css";
import { TerminalPrompt } from "@/components/terminal/terminal-prompt";
import { TerminalTranscript } from "@/components/terminal/terminal-transcript";
import {
  evaluateCommand,
  type TerminalOutputLine,
} from "@/lib/terminal/evaluate";
import { isPublicPath, type PublicRouteRegistry } from "@/lib/terminal/routes";
import {
  appendCommandHistory,
  appendTranscript,
  type TranscriptEntry,
} from "@/lib/terminal/session";

const subscribeToNothing = () => () => {};

export function TerminalSession({
  registry,
}: {
  registry: PublicRouteRegistry;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const entryId = useRef(0);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(0);
  const historyDraft = useRef("");
  const previousDirectory = useRef<string | null>(null);
  const lastCanonicalDirectory = useRef<string | null>(
    isPublicPath(registry, pathname) ? pathname : null,
  );
  const pendingNavigation = useRef<{
    href: string;
    command: string;
    lines: TerminalOutputLine[];
  } | null>(null);
  const navigationPending = pendingHref !== null && pendingHref !== pathname;

  function addEntry(
    command: string,
    tone: TranscriptEntry["tone"],
    lines: TranscriptEntry["lines"],
  ) {
    entryId.current += 1;
    setEntries((current) =>
      appendTranscript(current, {
        id: entryId.current,
        command,
        tone,
        lines,
      }),
    );
  }

  useEffect(() => {
    const currentIsPublic = isPublicPath(registry, pathname);
    const priorCanonical = lastCanonicalDirectory.current;
    if (currentIsPublic && pathname !== priorCanonical) {
      previousDirectory.current = priorCanonical;
      lastCanonicalDirectory.current = pathname;
    }

    const pending = pendingNavigation.current;
    if (!pending || pending.href !== pathname) return;

    pendingNavigation.current = null;
    const frame = window.requestAnimationFrame(() => {
      addEntry(pending.command, "output", pending.lines);
      setAnnouncement(`Navigated to ${pathname}.`);
      setPendingHref(null);
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, registry]);

  function submitCommand(rawInput: string) {
    if (pendingHref || pendingNavigation.current) return;

    const result = evaluateCommand({
      input: rawInput,
      cwd: pathname,
      previousDirectory: previousDirectory.current,
      registry,
    });
    if (result.kind === "noop") {
      setInput("");
      return;
    }

    const command = rawInput.trim();
    history.current = appendCommandHistory(history.current, command);
    historyIndex.current = history.current.length;
    historyDraft.current = "";
    setInput("");

    if (result.kind === "clear") {
      setEntries([]);
      setAnnouncement("Terminal output cleared.");
      return;
    }
    if (result.kind === "error") {
      addEntry(command, "error", [{ text: result.message }]);
      setAnnouncement(result.message);
      return;
    }
    if (result.kind === "output") {
      addEntry(command, "output", result.lines);
      setAnnouncement(
        result.lines.length
          ? result.lines.map(({ text }) => text).join(". ")
          : "No entries.",
      );
      return;
    }

    if (!result.changed) {
      addEntry(command, "output", result.lines);
      setAnnouncement(`Already at ${pathname}.`);
      return;
    }

    pendingNavigation.current = {
      href: result.href,
      command,
      lines: result.lines,
    };
    setPendingHref(result.href);
    router.push(result.href);
  }

  function changeInput(value: string) {
    setInput(value);
    if (historyIndex.current === history.current.length) {
      historyDraft.current = value;
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "Escape") {
      event.preventDefault();
      historyIndex.current = history.current.length;
      historyDraft.current = "";
      setInput("");
      return;
    }

    if (event.key === "ArrowUp") {
      if (history.current.length === 0) return;
      event.preventDefault();
      if (historyIndex.current === history.current.length) {
        historyDraft.current = input;
      }
      historyIndex.current = Math.max(0, historyIndex.current - 1);
      setInput(history.current[historyIndex.current]);
      return;
    }

    if (event.key === "ArrowDown") {
      if (historyIndex.current >= history.current.length) return;
      event.preventDefault();
      historyIndex.current += 1;
      setInput(
        historyIndex.current === history.current.length
          ? historyDraft.current
          : history.current[historyIndex.current],
      );
    }
  }

  function rejectMultilinePaste() {
    const message = "Paste rejected: submit one single-line command.";
    addEntry("[multiline paste]", "error", [{ text: message }]);
    setAnnouncement(message);
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.terminalPrompt}>
            {hydrated ? (
              <TerminalPrompt
                pathname={pathname}
                value={input}
                onChange={changeInput}
                onSubmit={submitCommand}
                onKeyDown={handleKeyDown}
                onRejectedPaste={rejectMultilinePaste}
                inputRef={inputRef}
                disabled={navigationPending}
              />
            ) : (
              <span className={styles.promptPlaceholder} aria-hidden="true">
                yasinghasemi.com: {pathname} $
              </span>
            )}
          </div>
          <SiteNavigation />
        </div>
        <noscript>
          <p className={styles.noScriptNote}>
            Shell commands require JavaScript. All pages remain available
            through the navigation links.
          </p>
        </noscript>
      </header>
      <TerminalTranscript entries={entries} announcement={announcement} />
    </>
  );
}
