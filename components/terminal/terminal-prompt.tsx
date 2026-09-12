"use client";

import Link from "next/link";
import { useId, type FormEvent, type KeyboardEvent } from "react";

import { MAX_COMMAND_LENGTH } from "@/lib/terminal/tokenize";

import styles from "./terminal.module.css";

export function TerminalPrompt({
  identity,
  pathname,
  value,
  onChange,
  onSubmit,
  onKeyDown,
}: {
  identity: string;
  pathname: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const inputId = useId();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form className={styles.prompt} onSubmit={submit}>
      <span className={styles.location}>
        <Link href="/" aria-label="Home">
          {identity}@yasinghasemi.com
        </Link>
        : <bdi>{pathname}</bdi> $
      </span>
      <label className={styles.visuallyHidden} htmlFor={inputId}>
        Website navigation command
      </label>
      <input
        id={inputId}
        className={styles.input}
        type="text"
        value={value}
        maxLength={MAX_COMMAND_LENGTH}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="go"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
      <button className={styles.submit} type="submit" aria-label="Run command">
        <span aria-hidden="true">↵</span>
      </button>
    </form>
  );
}
