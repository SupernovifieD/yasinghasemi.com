# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, React, strict TypeScript, and pnpm, using the repository's root-level `app/` convention. Public writing is server-rendered or prerendered; only the safe navigation shell and request-IP hydration require client-side behavior. A runtime-capable deployment is required for the first-party visitor-IP endpoint.

## Users

The primary audience is readers visiting Yasin Ghasemi's personal site to understand who he is and read his project notes, decisions, and lessons. Readers must be able to use ordinary links without knowing terminal commands; technically curious visitors may also navigate through the simulated shell.

## Product Purpose

The site is a focused personal publishing home for Yasin's existing and future writing. Success means every published article remains accurate and reachable, reading is comfortable on any supported viewport, and the shell interaction adds useful navigation without obstructing conventional browsing.

## Positioning

The site combines a minimal personal blog with a deliberately small, browser-side navigation shell whose virtual filesystem contains only validated public website routes. It is not an operating-system terminal, desktop simulation, portfolio dashboard, or marketing site.

## Operating Context

Visitors arrive through direct links, search results, current navigation, or archived HTML and hash bookmarks. They may read with JavaScript disabled, keyboard-only controls, touch input, enlarged text, reduced motion, or narrow viewports. The owner authors plain local Markdown posts without categories.

## Capabilities and Constraints

- Required public routes are `/`, `/about`, `/contact`, `/blog`, published `/blog/[slug]` pages, `/privacy`, `/terms`, and `/cookies`.
- The client shell supports only allowlisted `cd`, `pwd`, `ls`, `clear`, and `help` behavior over public routes. It never evaluates input or exposes server files, APIs, drafts, or archived directories.
- Five verified archived posts must be migrated without rewriting their historical content. Publication dates, excerpts, structure, emphasis, and links come from the audited archive.
- There are no categories, accounts, comments, CMS, database, analytics, contact form, payments, search service, or persistent terminal history.
- Contact destinations are GitHub, LinkedIn, and the explicitly requested display/link email pair. The spelling difference is retained for owner review.
- Visitor IP display is first-party, transient, uncached, and unavailable unless a trusted ingress explicitly supplies a validated value. The neutral fallback is `visitor`.
- The existing GitHub Pages configuration is static and cannot run the visitor endpoint. Hosting, DNS, proxy, or production infrastructure changes are outside this implementation's authority.

## Brand Commitments

The site name is `yasinghasemi.com`. The voice is direct, quiet, personal, and technically literate. The owner's current refresh brief replaces the old Windows 98 experiment while preserving its published writing and compatible legacy links.

## Evidence on Hand

- Current implementation repository: `/Users/yasin/yasinghasemi.com`
- Audited legacy archive: `/Users/yasin/Downloads/yasinghasemi.com-main.zip`, SHA-256 `d85defbafd1219a6dc1776274017e02c3bc6380d5783d7525bb64f9e538eb1ab`
- Five article HTML sources and `desktop/about.html` provide the only approved historical content basis.
- No current BluLexi repository snapshot, verified runtime host, reverse-proxy configuration, analytics provider, company entity, jurisdiction, or legal certification is available and none may be fabricated.

## Product Principles

- Writing and legibility come before spectacle.
- Every shell action is safe, truthful, bounded, and optional.
- One validated content catalogue drives routes, metadata, navigation, and legacy recovery.
- Progressive enhancement preserves ordinary reading and navigation.
- Unverified operational facts remain explicit handoff items, not public claims.

## Accessibility & Inclusion

Target WCAG 2.2 AA behavior with semantic structure, visible focus, keyboard and touch access, reflow at an effective 320 CSS pixels, comfortable contrast, reduced-motion support, and working core content without JavaScript.
