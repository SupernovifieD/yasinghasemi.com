"use client";

import Link from "next/link";
import {
  type RefObject,
  useId,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { MAX_COMMAND_LENGTH } from "@/lib/terminal/tokenize";

import styles from "./terminal.module.css";

export function TerminalPrompt({
  identity,
  pathname,
  value,
  onChange,
  onSubmit,
  onKeyDown,
  inputRef,
  disabled = false,
}: {
  identity: string;
  pathname: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
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
        ref={inputRef}
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
        disabled={disabled}
      />
      <button
        className={styles.submit}
        type="submit"
        aria-label="Run command"
        disabled={disabled}
      >
        <span aria-hidden="true">↵</span>
      </button>
    </form>
  );
}
