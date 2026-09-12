# Terminal blog refresh verification

Verified on 2026-09-12 from `/Users/yasin/yasinghasemi.com`. The GitHub Pages
conversion recorded below supersedes the original runtime-specific deployment
notes from earlier the same day.

## Delivered implementation

- Next.js 16.3.5 App Router application using the root-level `app/` convention,
  React 19.2.8, strict TypeScript 5.9.3, and pnpm 10.7.1.
- Server-rendered public routes for `/`, `/about`, `/contact`, `/blog`, all five
  `/blog/[slug]` articles, `/privacy`, `/terms`, and `/cookies`, plus real
  not-found and error experiences.
- Pitch-black monochrome CSS Modules interface with a self-hosted JetBrains Mono
  font, responsive normal-flow header/main/footer shell, center-left home and
  contact layouts, centered reading columns, and a left-positioned blog index.
- Normal links and an allowlisted browser navigation shell implementing `cd`,
  `pwd`, `ls`, `help`, and `clear`, including safe path resolution, bounded
  history/transcript state, IME and multiline-paste protection, `cd -`, and
  browser history synchronization.
- Exact static direct-HTML compatibility documents and a client-side hash bridge
  for recognized legacy routes. Folder-only legacy views recover to the flat blog
  index; categories were not restored.
- A static `yasinghasemi.com` terminal identity. The site does not inspect or
  display reader IP addresses.
- Canonical, social, and article metadata; sitemap and robots routes; a
  monochrome favicon; truthful privacy, terms, and cookie pages; and tested
  static-host-compatible response behavior.
- Impeccable working artifacts in `PRODUCT.md`, `DESIGN.md`, and
  `.impeccable/design.json`. The final interface review used the documented
  “Quiet Shell Manual” design system and found no material ship-blocking issue.

## Content migration

- Read-only source:
  `/Users/yasin/Downloads/yasinghasemi.com-main.zip`
- SHA-256:
  `d85defbafd1219a6dc1776274017e02c3bc6380d5783d7525bb64f9e538eb1ab`
- Archive inventory: 87 members, 1,205,832 expanded bytes, no absolute paths,
  traversal paths, or symlink members.
- Published source count: five. Published output count: five. The stale empty
  `1-NetRadar/2026-05-03` directory was excluded.
- Semantic comparison preserved titles, authoritative date-only publication
  values, excerpts, paragraph text/order, heading order, emphasis, and safe link
  destinations. The repeat dry run was byte-identical to the committed Markdown.
- Intentional conversion changes were limited to removing duplicate legacy `h1`
  elements, desktop wrappers, scripts/presentation attributes, unsafe URL
  schemes, and converting legacy italic markup to semantic Markdown emphasis.

| Old direct HTML route                                                           | Canonical route                                                | Published  |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------- |
| `/mydocuments/0-thebeginning/howitcametobe.html`                                | `/blog/the-story-of-this-blog`                                 | 2026-05-06 |
| `/mydocuments/1-NetRadar/1-howitstarted/howitstarted.html`                      | `/blog/how-netradar-was-started`                               | 2026-05-09 |
| `/mydocuments/2-MineralProspectivityMapping/why/why.html`                       | `/blog/why-i-started-mineral-prospectivity-mapping`            | 2026-05-12 |
| `/mydocuments/2-MineralProspectivityMapping/May-20/mpm-and-its-challenges.html` | `/blog/when-mpm-becomes-a-decision-marathon`                   | 2026-05-20 |
| `/mydocuments/Journal/06-09-2026/a-bit-of-bordom.html`                          | `/blog/three-fast-weeks-and-a-first-taste-of-paid-programming` | 2026-06-09 |

The matching old `/#/docs/...` article bookmarks resolve to the same canonical
routes. The old `#/docs`, `#/docs/1-NetRadar`,
`#/docs/2-MineralProspectivityMapping`, `#/docs/Journal`, and known folder views
resolve to `/blog`. The 2026-06-09 date came from `data-published`, not the
ambiguous source directory name.

## Verification evidence

| Check                                    | Result                                                                                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile --force` | Passed; 632 packages installed from the lockfile. pnpm reported that the dependency build script for `esbuild` remains unapproved. |
| `pnpm audit --audit-level high`          | Passed; no known vulnerabilities found.                                                                                            |
| `pnpm format:check`                      | Passed.                                                                                                                            |
| `pnpm lint`                              | Passed with zero warnings.                                                                                                         |
| `pnpm typecheck`                         | Passed.                                                                                                                            |
| `pnpm test --run`                        | Passed after the Pages conversion: 14 files, 150 tests.                                                                            |
| `pnpm build`                             | Passed as a static export: 17 pages, five generated article paths, and five exact legacy redirect documents in `out/`.             |
| `pnpm test:e2e`                          | Passed against the exported artifact: 117 tests across Chromium, Firefox, and WebKit in 3.2 minutes.                               |
| Legacy migration dry run                 | Passed: five audited sources; generated Markdown matched the checkout; two dry runs were identical.                                |
| Impeccable detector                      | Passed: `impeccable detect --json app components lib/site-config.ts` returned an empty issue list.                                 |
| Production console/network inspection    | Eight representative routes returned 200 with zero page/console errors and zero failed requests in Chromium.                       |

The browser suite covers normal and no-JavaScript navigation, reduced motion,
keyboard focus and history, terminal command/attack cases, every article,
canonical metadata, static legacy redirects/hash recovery, exported 404 behavior,
and responsive terminal containment. Playwright emits a harmless `NO_COLOR`
versus `FORCE_COLOR` warning.

Lighthouse 13.0.3 was run against the production server with its default mobile
throttling. These are measured local results, not claims about production:

| Route                                               | Performance | Accessibility |   FCP |   LCP |   CLS |      TBT |
| --------------------------------------------------- | ----------: | ------------: | ----: | ----: | ----: | -------: |
| `/`                                                 |          64 |           100 | 1.6 s | 3.5 s | 0.028 |   650 ms |
| `/blog`                                             |          60 |           100 | 1.5 s | 3.5 s | 0.036 |   930 ms |
| `/blog/why-i-started-mineral-prospectivity-mapping` |          68 |           100 | 1.0 s | 3.5 s |     0 | 1,040 ms |

The performance scores do not meet an “excellent” numeric target in this local
throttled run. The largest reported cost was framework client-script main-thread
work, despite only about 26 KiB of Lighthouse-identified unused JavaScript. This
is reported as an unresolved measurement/result rather than relabeled as a pass.

Visual evidence was inspected at 320, 390, 768, 1024, 1440, and 1920 CSS pixels,
plus a 768x420 short viewport, 200% text enlargement, and an effective 320-pixel
reflow case. Computed document width matched viewport width on home, About,
Contact, blog, the longest-title article, and Privacy at every checked size.
Representative screenshots are in `/tmp/yasin-visual.g0GwLV/`:

- `home-1440.png`, `home-320.png`
- `about-1440.png`, `about-320.png`
- `contact-1440.png`, `contact-320.png`
- `blog-1440.png`, `blog-320.png`
- `long-post-1440.png`, `long-post-320.png`
- `privacy-1440.png`, `privacy-320.png`
- `long-post-200-percent-text.png`

Desktop and touch-layout behavior, focused/unfocused terminal states, long path
wrapping, transcript expansion/clearing, footer placement, and local overflow were
inspected. A physical mobile keyboard and a literal browser 400% zoom session were
unavailable; the touch viewport, touch submit control, 200% text, and equivalent
320-pixel reflow were tested instead.

GitHub and LinkedIn hrefs match the requested sources. GitHub returned HTTP 200 in
an automated live check; LinkedIn returned its bot-throttling HTTP 999 response,
so its destination syntax and rendered href are verified but an authenticated
human LinkedIn visit was not. No email was sent.

## Git and push record

- Repository: `https://github.com/SupernovifieD/yasinghasemi.com.git`
- Branch: `main`, tracking `origin/main`
- Starting SHA: `db4cea49dedc11a2db0b9a00c2439ccb22383443`
- Every implementation commit below was pushed immediately and verified with
  `git ls-remote` before the next increment.

Ordered implementation commits before this final report:

1. `64cafb8` `docs: record personal site refresh baseline`
2. `8227d8e` `test: establish frontend quality checks`
3. `e0777f5` `docs: capture personal site product context`
4. `e11f4bf` `feat: define site configuration and public routes`
5. `1bd8b04` `style: establish monochrome design tokens`
6. `2d51ac9` `style: add readable terminal typography`
7. `20223ff` `feat: build responsive site shell`
8. `758de70` `feat: add terminal style site navigation`
9. `1857fd2` `feat: add footer copyright and policy navigation`
10. `069b8ff` `fix: make header navigation reflow cleanly`
11. `9d25ba0` `style: establish readable article layout`
12. `ea02ae1` `feat: create minimal welcome homepage`
13. `315d593` `feat: create concise about page`
14. `2f99613` `feat: create minimal contact page`
15. `1665bea` `feat: define validated flat post model`
16. `a553238` `feat: load and sort published posts`
17. `9c271bb` `chore: inventory legacy article sources`
18. `c99872f` `chore(content): add safe legacy post conversion`
19. `6b38b31` `content(blog): migrate the story of this blog`
20. `9736e66` `content(blog): migrate netradar origin post`
21. `5b8e599` `content(blog): migrate mineral mapping motivation post`
22. `78b1e71` `content(blog): migrate mineral mapping decision post`
23. `15cee1d` `content(blog): migrate three fast weeks post`
24. `f239996` `chore(content): preserve generated post formatting`
25. `623e4d4` `test(content): verify legacy content migration parity`
26. `ae4f030` `feat(blog): add chronological results list`
27. `ead78b7` `feat(blog): render individual blog posts`
28. `9a6502a` `style(blog): refine long form content rendering`
29. `c189b3f` `feat(routing): define legacy route migration map`
30. `cc5dfdd` `feat(routing): redirect legacy article urls`
31. `b4345c9` `feat(routing): recover legacy document bookmarks`
32. `c84695c` `feat(terminal): define public navigation filesystem`
33. `dde126e` `feat(terminal): resolve safe navigation paths`
34. `5ec9976` `feat(terminal): parse supported commands safely`
35. `0e4a9a2` `feat(terminal): add information commands`
36. `6c8df48` `feat(terminal): add directory navigation`
37. `e8f5d6b` `feat(terminal): add clear and safe command errors`
38. `88faed5` `feat(terminal): add accessible prompt input`
39. `946e633` `feat(terminal): add bounded transcript output`
40. `ce33e13` `feat(terminal): synchronize shell and browser navigation`
41. `9180eb0` `feat(terminal): refine keyboard interaction`
42. `3acc1c7` `fix(terminal): prevent narrow viewport collisions`
43. `54e96a8` `feat(visitor): validate ip from trusted ingress`
44. `7336ea7` `feat(visitor): add private ip endpoint`
45. `c54e7ed` `feat(visitor): hydrate prompt identity safely`
46. `fd71fe2` `docs(visitor): specify ip trust and cache requirements`
47. `03e7bc6` `content(policy): add site privacy policy`
48. `781c0bf` `content(policy): add personal blog terms`
49. `993ccf7` `content(policy): add truthful cookie management`
50. `bc3cc52` `feat(metadata): add canonical page and article metadata`
51. `8a4c901` `feat(metadata): add publishing discovery routes`
52. `6f526a0` `feat(errors): add minimal recovery and site identity states`
53. `9566c7d` `fix(accessibility): improve skip and transcript keyboard access`
54. `0b0613a` `test(accessibility): verify progressive enhancement`
55. `163d1ec` `fix(security): harden public response headers`
56. `ab36283` `test(core): cover terminal and content edge cases`
57. `f0f88f6` `fix(terminal): serialize rapid navigation submissions`
58. `79fed4f` `test(terminal): cover browser navigation journeys`
59. `e07a727` `test(content): cover article and legacy access`
60. `c17e0d9` `test(visitor): verify identity isolation and failure handling`
61. `e7ddabb` `docs(design): record impeccable visual system`
62. `ae4448a` `docs(publishing): document authoring and site operation`
63. `eddc9cd` `test(e2e): stabilize cross browser event coverage`

GitHub Pages conversion commits:

1. `00fe8ce` `refactor(visitor): remove visitor identity feature`
2. `cb1594f` `build(pages): export static site artifact`
3. `00d94b1` `ci(pages): deploy static next export`
4. `6ffd6bc` `fix(tooling): generate next types before checking`

The first custom workflow run exposed that a clean checkout had no generated Next
route types. The fourth commit fixed that reproducibility gap. GitHub Actions run
`34697307656` then passed installation, formatting, lint, type checking, unit tests,
static export, artifact upload, and deployment. The Pages build source was changed
from the legacy branch/Jekyll mode to the repository workflow after that verified
deployment.

## Operations and owner review

- The required contact display is `y@yasinghasemi.com`, while its deliberately
  different requested link target is `mailto:y@yasinassemi.com`. This is preserved
  exactly and remains an owner-review item.
- The policy pages make no unverified claim about hosting providers, legal
  jurisdiction, infrastructure log retention, or optional cookies. Those facts
  require owner/hosting review if the operating environment changes.
- The reader-IP feature and its endpoint were removed by owner request. The prompt
  now uses `yasinghasemi.com` as its static identity.
- GitHub Pages is configured to deploy from GitHub Actions. The custom workflow
  verifies the repository, builds `out/`, uploads that artifact, and deploys it to
  the `github-pages` environment. The live domain was verified against the new
  application after the successful run.
- No DNS, Cloudflare, Nginx, firewall, hosting-account, remote, or branch change
  was performed. The Pages build-source setting changed from legacy Jekyll to the
  repository workflow as part of the authorized deployment conversion.
