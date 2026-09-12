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

## Visitor identity and environment

No environment variable is required for normal local reading. With no trusted
ingress configuration, `/api/visitor` deliberately returns `{ "ip": null }` and
the prompt shows `visitor`.

`VISITOR_IP_TRUST_MODE=trusted-proxy` is permitted only behind an ingress that
overwrites `X-Yasinghasemi-Client-IP` with a validated client address and prevents
direct public access to the Next.js upstream. The complete trust, spoofing, and
no-cache checklist is in `docs/visitor-ip-deployment.md`. Naming a header in an
environment variable does not establish trust.

## Runtime and deployment boundary

Run the production application with `pnpm build` followed by `pnpm start`. Public
pages and posts are prerendered, while `/api/visitor` requires a request-capable
Next.js runtime behind the verified private ingress.

The repository's currently configured GitHub Pages deployment publishes static
files from `main` at the repository root. That service cannot execute the visitor
route or serve this application as a normal Next.js runtime. Pushing code is not a
substitute for the separately authorized hosting, proxy, cache, origin-protection,
and DNS work described in the deployment checklist. Do not enable a static export
while claiming the visitor endpoint will run.

## Storage and policy changes

The baseline application sets no cookies and keeps terminal history, transcript,
and hydrated IP state only in memory. Before adding analytics, optional storage,
external assets, or another processor, update the actual controls and the Privacy
Policy and Cookie Management page together. Never add a banner or preference
toggle that does not control real behavior.
