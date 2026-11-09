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
  list, generated article paths, home blog preview, and sitemap.
- Do not add category or tag fields. The schema rejects both because the public
  model is intentionally flat.
- Start the body below frontmatter without repeating the title as an `h1`; the
  article route renders that title. Markdown may use paragraphs, `h2`/`h3`,
  emphasis, lists, blockquotes, fenced code, tables, and images with useful alt
  text. Raw HTML is not rendered.

Each post needs a social card (the image shown when a link is shared), made from
its title and excerpt. After the post is final, run
`pnpm exec tsx scripts/generate-og-images.ts posts` (it renders every published
post into `assets/og/posts/<slug>.png`; it needs the site's JetBrains Mono files in
`app/fonts`, which are in the repository), import the new image in
`lib/og-images.ts`, and look at it. Run it again after changing a title or
excerpt. A unit test fails for a published post without a card; pages without an
image of their own share `assets/og/default.png`.

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

## Add or revise a project

Projects live in one array, `lib/projects.ts`; the Projects page lists, the hover
descriptions, each `/projects/<slug>` page, the technology rows, and the sitemap
all read from it. To add one, add an entry with:

- `slug` (lowercase, hyphenated; it is the URL and the screenshot name), `name`
  (the label shown), and `category` (`software` or `web`). Order in the array is
  display order within its category.
- `tagline`: one line of at most 48 characters, shown on hover.
- `summary`: the page's meta description (up to 170 characters).
- `tech`: ids from `lib/tech.ts`. To add a technology, import its logo from
  `simple-icons` there; if a brand color is black or too dark to read on the
  black page, give it an override (the unit test fails below 3:1 contrast).
- `sections`: first-person headings and paragraphs, `url` (live site) and `links`
  (documentation, package, source), and `status` for an unlaunched project.

If the project has a website, capture its screenshot with
`pnpm exec tsx scripts/capture-project-screenshots.ts url <slug> <url>` (it is
cropped to the shared `--shot-aspect` and saved to `assets/projects/<slug>.webp`),
import it in `components/projects/project-shots.ts`, and a unit test confirms
every project with a website has one. Without a website, the hover panel shows a
"Work in progress" placeholder instead.

## Static preview and deployment

JetBrains Mono v2.304 is bundled in `app/fonts/` (Regular, Medium, and Bold WOFF2)
from the [official release](https://github.com/JetBrains/JetBrainsMono/tree/v2.304/fonts/webfonts).
Its SIL Open Font License is retained alongside the files. `next/font/local`
serves these assets from the site, so builds require no Google Fonts fetch.

`pnpm build` creates the complete static site in `out/`. `pnpm start` serves that
generated directory for local production-style review; rebuild after changing
application or content files.

Pushes to `main` run `.github/workflows/deploy-pages.yml`. The workflow installs
the frozen pnpm graph, checks formatting, lint, types, and unit tests, builds the
static export, and deploys the `out/` artifact through the `github-pages`
environment. GitHub Pages must remain configured with **GitHub Actions** as its
build source so the Jekyll branch build cannot replace the Next.js export.

The custom domain is recorded in `public/CNAME`, and `public/.nojekyll` preserves
Next.js `_next` assets. GitHub Pages cannot provide request-time Next.js routes or
custom `next.config.ts` response headers.

## Storage and policy changes

The baseline application sets no cookies and keeps no persistent client state.
Before adding analytics, optional storage, external assets, or another
processor, update the actual controls and the Privacy Policy together, and add a
cookie page and a footer link only once there is real behavior for it to
describe. Never add a banner or preference toggle that does not control real
behavior.
