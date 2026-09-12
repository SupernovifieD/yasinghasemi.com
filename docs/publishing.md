# Publishing and operation

## Add or revise a post

Posts are plain Markdown files in `content/posts/`. A filename must exactly match
its slug plus `.md`. Use this frontmatter shape:

```md
---
title: "A complete post title"
slug: "a-complete-post-title"
publishedAt: "2026-09-12"
excerpt: "A concise description used on the blog index and in metadata."
draft: true
---

Post body.
```

- Use a lowercase, hyphen-separated slug. The schema rejects unsafe slugs and a
  filename that does not match its slug.
- Keep `publishedAt` as a real `YYYY-MM-DD` calendar date. Date-only values are
  formatted in UTC so the displayed day does not move with a reader's timezone.
- Add `updatedAt` only for a documented editorial update; it cannot precede the
  publication date.
- Keep work unpublished with `draft: true`. Drafts are excluded from the blog
  list, generated article paths, terminal route registry, and sitemap.
- Do not add category or tag fields. The schema rejects both because the public
  model is intentionally flat.
- Start the body below frontmatter without repeating the title as an `h1`; the
  article route renders that title. Markdown may use paragraphs, `h2`/`h3`,
  emphasis, lists, blockquotes, fenced code, tables, and images with useful alt
  text. Raw HTML is not rendered.

Before changing `draft` to `false`, run:

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Check the article directly, its position on `/blog`, its metadata, its mobile
reflow, and every link. Newest-first order comes from `publishedAt`, with slug as
the deterministic tie-breaker.

## Legacy migration tool

The archived five-post import is reproducible and read-only by default:

```sh
pnpm migrate:legacy --archive /Users/yasin/Downloads/yasinghasemi.com-main.zip --dry-run
```

The tool validates ZIP paths and expansion limits, inventories only published
`article` elements under `mydocuments/`, and checks semantic parity before it can
emit Markdown. It never executes archived scripts. The audited source hash,
mapping, and transformations are recorded in `docs/content-migration.md`.

## Terminal maintenance

The shell is only a public-route navigator. Its supported commands are `cd`,
`pwd`, `ls`, `clear`, and `help`; do not connect it to a process, server action,
filesystem, URL passthrough, or arbitrary router destination. Post directories in
`ls /blog` come from the validated published catalogue. When routes change,
update the single public registry and its resolver/evaluator tests rather than
adding a second route list in a client component.

## Static preview and deployment

`pnpm build` creates the complete static site in `out/` and then adds five exact
legacy HTML redirect documents. `pnpm start` serves that generated directory for
local production-style review; rebuild after changing application or content
files.

Pushes to `main` run `.github/workflows/deploy-pages.yml`. The workflow installs
the frozen pnpm graph, checks formatting, lint, types, and unit tests, builds the
static export, and deploys the `out/` artifact through the `github-pages`
environment. GitHub Pages must remain configured with **GitHub Actions** as its
build source so the legacy Jekyll branch build cannot replace the Next.js export.

The custom domain is recorded in `public/CNAME`, and `public/.nojekyll` preserves
Next.js `_next` assets. The prompt uses the static `yasinghasemi.com` identity and
does not inspect or display reader IP addresses. GitHub Pages cannot provide
request-time Next.js routes or custom `next.config.ts` response headers.

## Storage and policy changes

The baseline application sets no cookies and keeps terminal history and transcript
only in memory. Before adding analytics, optional storage, external assets, or
another processor, update the actual controls and the Privacy Policy and Cookie
Management page together. Never add a banner or preference toggle that does not
control real behavior.
