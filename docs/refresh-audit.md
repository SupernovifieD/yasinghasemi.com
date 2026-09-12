# Personal site refresh audit

## Starting state

- Audited: 2026-09-12 in `/Users/yasin/yasinghasemi.com`
- Repository: `https://github.com/SupernovifieD/yasinghasemi.com.git`
- Branch and upstream: `main` tracking `origin/main`
- Starting commit: `db4cea49dedc11a2db0b9a00c2439ccb22383443`
- Ahead/behind at audit: `0/0`
- Worktree at audit: clean; the ignored `.DS_Store`, `.next/`, `next-env.d.ts`, and `node_modules/` paths were not owner changes

Commit `e17578e` intentionally removed the archived Windows 98 application and its assets. The current checkout contains the minimal Next.js scaffold added afterward. The refresh will not restore the deleted desktop application, its JavaScript, icons, CV, or other unrelated assets.

## Verified toolchain

- Package manager: pnpm 10.7.1, declared by `packageManager` and `pnpm-lock.yaml`
- Installed application: Next.js 16.3.5, React 19.2.8, strict TypeScript 5.9.3
- Local Node.js: 26.7.0; the installed Next.js guide requires Node.js 20.9 or newer
- Existing commands at audit: `pnpm dev`, `pnpm build`, and `pnpm lint`
- Application convention: root-level `app/`; `src/` will not be introduced
- Styling baseline: Tailwind CSS 4 from the generated scaffold; the refresh may simplify this to one coherent styling system

No environment examples, application tests, browser tests, tracked deployment files, or tracked GitHub Actions workflows were present at the starting commit.

## Source archive

- File: `/Users/yasin/Downloads/yasinghasemi.com-main.zip`
- SHA-256: `d85defbafd1219a6dc1776274017e02c3bc6380d5783d7525bb64f9e538eb1ab`
- Archive root: `yasinghasemi.com-main/`
- Inventory: 87 entries, 1,205,832 uncompressed bytes

The member listing contains one relative archive root, no absolute paths, no `..` traversal segments, and no symlink entries. Archived code will be treated as untrusted data and will not be executed. Only the five audited article HTML files and biographical source text will be read for migration.

## Push and deployment behavior

At the initial audit, GitHub Pages used its legacy Jekyll build from `main` at the
repository root. That process rendered the repository README rather than the
Next.js application.

On 2026-09-12, the owner authorized a GitHub Pages conversion and removal of the
request-specific identity feature. The application now produces a static `out/`
artifact, `.github/workflows/deploy-pages.yml` verifies and deploys it, and the
repository Pages source is set to `workflow`. The custom domain remains
`yasinghasemi.com`; no DNS or hosting-account change was made.

## Known owner-review item

The requested contact presentation deliberately differs from the archived address: display `y@yasinghasemi.com`, link target `mailto:y@yasinassemi.com`. The refresh will preserve that exact discrepancy and flag it for owner review without sending email.
