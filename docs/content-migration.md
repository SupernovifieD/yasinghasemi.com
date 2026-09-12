# Content migration reconciliation

The migration source is the read-only archive at
`/Users/yasin/Downloads/yasinghasemi.com-main.zip`, SHA-256
`d85defbafd1219a6dc1776274017e02c3bc6380d5783d7525bb64f9e538eb1ab`.
It contains 87 ZIP entries and exactly five published `article` elements under
`mydocuments/`. The stale empty `1-NetRadar/2026-05-03` folder is not a post.

| Legacy source                                                                  | Canonical route                                                | Published  | Paragraphs |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------- | ---------- | ---------: |
| `mydocuments/0-thebeginning/howitcametobe.html`                                | `/blog/the-story-of-this-blog`                                 | 2026-05-06 |          7 |
| `mydocuments/1-NetRadar/1-howitstarted/howitstarted.html`                      | `/blog/how-netradar-was-started`                               | 2026-05-09 |         10 |
| `mydocuments/2-MineralProspectivityMapping/why/why.html`                       | `/blog/why-i-started-mineral-prospectivity-mapping`            | 2026-05-12 |          7 |
| `mydocuments/2-MineralProspectivityMapping/May-20/mpm-and-its-challenges.html` | `/blog/when-mpm-becomes-a-decision-marathon`                   | 2026-05-20 |          7 |
| `mydocuments/Journal/06-09-2026/a-bit-of-bordom.html`                          | `/blog/three-fast-weeks-and-a-first-taste-of-paid-programming` | 2026-06-09 |          6 |

The converter removes the duplicate legacy `h1`, desktop wrappers, scripts, and
unsafe link schemes. It changes legacy `<i>` emphasis to semantic Markdown
emphasis. It otherwise preserves the author's visible wording, paragraph order,
`h2`/`h3` order, emphasis count, and safe link destinations. No categories,
project fields, tags, images, or migration-date `updatedAt` values were imported.

The final dry run matched the audited five-source manifest. Every committed
Markdown file was byte-compared with fresh converter output. Two complete dry runs
were also byte-identical, establishing idempotent output for this archive. The
Journal article uses its authoritative `data-published="2026-06-09"` value; the
ambiguous folder name was not used to infer its date.

Re-run the audit without writing to the checkout:

```sh
pnpm migrate:legacy --archive /Users/yasin/Downloads/yasinghasemi.com-main.zip --dry-run
```
