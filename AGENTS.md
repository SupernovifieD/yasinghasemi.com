<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Working rules
- Tell the user clearly when their request or assumption is based on a misconception.
- Read the relevant files before proposing or making changes.
- Prefer editing existing files to creating new ones.
- Do not create new documentation or README files unless the task requires them or the user explicitly asks.
- Use this order for non-trivial work: inspect, plan, implement, verify, report.
- Before reporting a task complete, perform the most relevant available verification step and inspect the actual output.
- Report outcomes faithfully. If checks or runtime behavior fail, say so and include the relevant evidence.
- If a verification step was not run, say exactly which step was skipped and why.
- Never characterize incomplete, partially verified, or broken work as done.
- For non-trivial changes, require an independent verification pass before reporting completion.
- Do not use destructive shortcuts or bypass checks to make a problem disappear. Investigate the root cause first.
- Ask before risky or hard-to-reverse actions unless this repo explicitly preauthorizes them.
- Use dedicated read/search/edit tools when they are available instead of shell one-liners.
- Prefer exact evidence and file_path:line_number references over vague summaries.
- If a result is verified and complete, state that plainly rather than hedging it.

## Committing rules

- Do not commit before inspecting the relevant diff.
- Do not commit code that has not been verified with the most relevant available check.
- Prefer focused commits over large mixed commits.
- Each commit should represent one coherent change.
- Do not combine unrelated fixes, refactors, formatting, and feature work in the same commit.
- Use conventional commit messages with this format:
  type(scope): description

### Common commit types:

  * `feat`: new user-facing or developer-facing capability
  * `fix`: bug fix
  * `refactor`: internal restructuring without behavior change
  * `style`: visual/UI styling change or formatting-only change
  * `test`: tests added or updated
  * `docs`: documentation-only change
  * `chore`: maintenance, tooling, config, dependency, or cleanup work
  * `perf`: performance improvement
  * `build`: build system or dependency changes
  * `ci`: CI/CD workflow changes

* The scope should name the area changed, for example:

  * `auth`
  * `sidebar`
  * `layout`

* Good examples:

  * `feat(auth): add dev auth mode`
  * `fix(sidebar): keep icons aligned during collapse`
  * `refactor(vocab): unify collection routes`

* Bad examples:

  * `updates`
  * `fix stuff`
  * `final changes`

* Before committing, run the most relevant available verification:

* If verification is skipped, do not pretend it passed. State exactly what was skipped and why.

* Do not use `--no-verify` unless the user explicitly approves it and the reason is documented.

* Do not amend, squash, rebase, reset, or force-push unless the user explicitly asks or the repo workflow requires it.

* Do not commit generated files, build artifacts, logs, caches, or environment files unless they are intentionally tracked.

* Do not commit secrets, tokens, credentials, private keys, `.env` files, or user data.

* After committing, report:

  * commit message
  * files changed
  * verification performed
  * any remaining risks or skipped checks


### Additional high-value constraints
- Do not assume the environment is correctly set up; verify dependencies, paths, and configs before execution.
- When modifying logic, check for downstream dependencies and update them if necessary.
- Do not silently ignore warnings; treat them as signals unless proven irrelevant.
- When debugging, reproduce the issue first before attempting fixes.
- Prefer minimal, reversible changes over broad refactors unless explicitly required.
- If multiple approaches exist, briefly evaluate tradeoffs before choosing.
- Do not rely on cached assumptions from earlier steps; re-check critical facts when needed.
- When working with configs or pipelines, validate end-to-end flow, not just individual components.
- Explicitly call out any assumptions you are making that are not verified.
