# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, React, strict TypeScript, and pnpm, using the repository's root-level `app/` convention. The site is built as a static export for GitHub Pages; public writing is prerendered and only navigation and the desktop home-page previews require client-side behavior.

## Users

The primary audience is readers visiting Yasin Ghasemi's personal site to understand who he is and read his project notes, decisions, and lessons. Readers must be able to reach every page through ordinary links.

## Product Purpose

The site is a focused personal publishing home for Yasin's existing and future writing. Success means every published article remains accurate and reachable, reading is comfortable on any supported viewport, and the desktop home previews add discovery without obstructing conventional browsing.

## Positioning

The site combines a minimal personal blog with a small set of desktop-only hover previews on the home page. It is not an operating-system terminal, desktop simulation, portfolio dashboard, or marketing site.

## Operating Context

Visitors arrive through direct links, search results, or current navigation. They may read with JavaScript disabled, keyboard-only controls, touch input, enlarged text, reduced motion, or narrow viewports. The owner authors plain local Markdown posts without categories.

## Capabilities and Constraints

- Required public routes are `/`, `/about`, `/contact`, `/projects`, `/blog`, published `/blog/[slug]` pages, `/privacy`, `/terms`, and `/cookies`.
- Each published post is its own static page at `/blog/[slug]`.
- Home hover previews are enhancements for fine-pointer desktop only. They never evaluate input, expose drafts, or replace a link.
- There are no categories, accounts, comments, CMS, database, analytics, contact form, payments, or search service.
- Contact destinations are GitHub, LinkedIn, and `y@yasinghasemi.com` for both the displayed address and mail link.
- GitHub Actions verifies and publishes the generated `out/` artifact to GitHub Pages. The static host cannot provide request-time application behavior.

## Brand Commitments

The site name is `yasinghasemi.com`. The voice is direct, quiet, personal, and technically literate.

## Evidence on Hand

- Current implementation repository: `/Users/yasin/yasinghasemi.com`
- No current BluLexi repository snapshot, verified runtime host, reverse-proxy configuration, analytics provider, company entity, jurisdiction, or legal certification is available and none may be fabricated.

## Product Principles

- Writing and legibility come before spectacle.
- Every preview is optional, decorative, and never the only way to reach content.
- One validated content catalogue drives routes, metadata, and navigation.
- Progressive enhancement preserves ordinary reading and navigation.
- Unverified operational facts remain explicit handoff items, not public claims.

## Accessibility & Inclusion

Target WCAG 2.2 AA behavior with semantic structure, visible focus, keyboard and touch access, reflow at an effective 320 CSS pixels, comfortable contrast, reduced-motion support, and working core content without JavaScript.
