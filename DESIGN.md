---
name: yasinghasemi.com
description: A pitch-black publishing shell where writing remains the primary interface.
colors:
  page-black: "#000000"
  panel-black: "#080808"
  hover-black: "#111111"
  divider-gray: "#262626"
  primary-white: "#f5f5f5"
  body-gray: "#d4d4d4"
  muted-gray: "#a3a3a3"
  outline-gray: "#d4d4d4"
  focus-white: "#ffffff"
typography:
  display:
    fontFamily: "JetBrains Mono, ui-monospace, DejaVu Sans Mono, Liberation Mono, monospace"
    fontSize: "clamp(1.5rem, 1.35rem + 0.6vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "JetBrains Mono, ui-monospace, DejaVu Sans Mono, Liberation Mono, monospace"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.22
  title:
    fontFamily: "JetBrains Mono, ui-monospace, DejaVu Sans Mono, Liberation Mono, monospace"
    fontSize: "clamp(1.125rem, 1.05rem + 0.3vw, 1.25rem)"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "JetBrains Mono, ui-monospace, DejaVu Sans Mono, Liberation Mono, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.78
  label:
    fontFamily: "JetBrains Mono, ui-monospace, DejaVu Sans Mono, Liberation Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  square: "0"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
  10: "2.5rem"
  12: "3rem"
  16: "4rem"
components:
  navigation-link:
    backgroundColor: "{colors.page-black}"
    textColor: "{colors.body-gray}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    height: "2.75rem"
---

# Design System: yasinghasemi.com

## Overview

**Creative North Star: "The Quiet Manual"**

The site combines the economy of a Unix manual page with the calm pacing of a small literary publication. Pitch black is the canvas, neutral text carries every hierarchy, and slash-prefixed route names appear only where they explain navigation. The result should feel authored and technical without becoming a terminal emulator, dashboard, or hacker-film prop.

The writing is always the product. Layout, controls, and responsive behavior protect reading and ordinary navigation before anything decorative.

**Key Characteristics:**

- Absolute black ground with a neutral gray-to-white hierarchy.
- One self-hosted monospace family and no decorative type pairing.
- Flat, square, line-based controls without cards or ornamental surfaces.
- A two-column home (welcome and links left, hover preview right on desktop) beside shared centered reading columns.
- Progressive enhancement: plain links and a native disclosure menu work without JavaScript.

## Colors

The palette is strictly achromatic; contrast and typography, not hue, communicate state.

### Primary

- **Primary White:** Highest-emphasis headings, links, active states, and focus.

### Neutral

- **Page Black:** Default page and control ground.
- **Panel Black:** Subtle bounded code surfaces.
- **Hover Black:** Quiet hover fill on compact controls.
- **Divider Gray:** Decorative rules and resting control borders; never the sole control indicator.
- **Body Gray:** Long-form copy and normal text.
- **Muted Gray:** Dates, hints, and footer copy.
- **Outline Gray:** Interactive control borders when stronger definition is needed.

### Named Rules

**The No Accent Rule.** State is expressed with weight, underline, border, and white focus treatment; never introduce a chromatic accent. Project screenshots and the contact logos are content, not interface color.

**The Readability Rule.** Muted text remains real readable text, not low-opacity decoration.

## Typography

- **Display Font:** JetBrains Mono with the project monospace fallback chain
- **Body Font:** JetBrains Mono with the project monospace fallback chain
- **Label/Mono Font:** JetBrains Mono with the project monospace fallback chain

**Character:** The single-family system is direct and technical, with normal prose rhythm rather than preformatted density. Programming ligatures remain disabled so punctuation is literal.

### Hierarchy

- **Display** (700, fluid 1.5–1.75rem, 1.2): Homepage, Contact, and primary page headings.
- **Headline** (700, 1.25rem, 1.22): Long-form section headings.
- **Title** (700, fluid 1.125–1.25rem, 1.35): Blog result titles.
- **Body** (400, 1rem, 1.78): Reading columns constrained to about 70 characters. Short-page copy uses 0.9375rem.
- **Label** (400, 0.875rem, 1.55): Navigation, hints, and footer metadata.

### Named Rules

**The Prose Is Not Preformatted Rule.** Use semantic paragraphs and natural wrapping; never turn articles into a preformatted text wall.

## Layout

The outer shell is a normal-flow column with a 100rem maximum width, fluid 1.25–2.5rem gutters, and a footer pushed to the bottom only when content is short. Articles, policy pages, About, Contact, and the blog index share a centered 70ch column measured at the reading font size. The blog index stays top-aligned with a `/blog` heading and left-aligned results. About, Contact, and Projects share the same vertically centered short-page layout with a route-name heading above left-aligned compact content, centered at every width; only short screens (under 42rem tall) top-align, so a block taller than the viewport flows from the top. The About page ends with an ASCII portrait on the gray glow.

The home page has no header at any width: it carries its own links, one per line under the welcome note. On every other page the header is the site name at the left and, from 64rem, the four route links (`/projects`, `/blog`, `/about`, `/contact`) at the right; below 64rem the links move into a hamburger button whose panel lists them centered. The header and footer text is 0.8125rem and their bars are compact (header 4rem desktop, 3.5rem phones; footer 3.75rem); touch targets stay at least 2.75rem. On phones the footer strip stacks and centers. The footer carries the privacy and terms links only. Code and tables may scroll inside their own bounded containers; the document itself must not scroll horizontally.

From 64rem the home page is one centered group of two columns (33rem and 34rem, 1rem apart): the welcome note with its links on the left, and the preview stage on the right, so the note sits close to the stage instead of at the far-left edge. Below 64rem it is one column with the same links and no stage; there the text block is vertically centered and, where it fits the viewport (phones about 640px tall and up), the page does not scroll. On shorter screens it scrolls rather than clipping.

The Projects page is top-aligned like the blog index, with a centered `/projects` heading and one-line subtitle, so the heading never moves when a list opens. The project pages share the blog post layout.

## Elevation & Depth

The system is flat and uses no shadows, glow, blur, or simulated glass. Hierarchy comes from black surface steps and one-pixel neutral dividers.

### Named Rules

**The Flat Document Rule.** A new surface must earn its boundary through content or interaction; never add card elevation as decoration. The one exception is the Preview Stage.

**The Preview Stage Rule.** A flat gray radial glow, canvas drawing, and WebGL are allowed only inside the home page's desktop preview stage and the About page's portrait stage, and nowhere else. The glow is the shared `--glow-gradient` (gray, never colored). In the home stage it is the same size for every link and appears on the first hover and then stays; on the About page it sits behind the portrait. Every animation inside either stage is reduced or removed under `prefers-reduced-motion`.

**The Category Glow Exception.** The two category icons on the Projects page may sit on a small version of the same gray glow (an 8.5rem square using `--glow-gradient`), and may drift very slowly (about 3px over 8–9.5 seconds). Both are gray, subtle, and removed under `prefers-reduced-motion`.

## Shapes

Controls and bounded content use square corners. One-pixel rules and underlines supply the recurring geometry. Rounded pills, badges, chips, and fake window chrome do not belong in this system.

## Components

### Buttons

- **Shape:** Square and compact, with a minimum 2.75rem touch dimension.
- **Primary:** Transparent black ground, neutral one-pixel border, white text.
- **Hover / Focus:** Hover strengthens the border and applies the quiet hover surface; keyboard focus uses the shared two-pixel white outline.

### Navigation

Primary navigation is a row of literal route links. Hover and active states brighten the text and reveal a thin underline; active state is also carried semantically with `aria-current`. Below 64rem the links move into a hamburger menu built on a native `<details>` disclosure so it works without JavaScript; it closes on Escape, outside press, choosing a link, or a route change, and its icon turns into a close mark.

### Home Preview Stage

On fine-pointer desktop only, hovering or focusing a home link shows that link's preview in a square stage; the last hovered link stays selected until another is hovered or the page reloads. Previews load lazily on first use, crossfade, and pause while inactive. Touch devices and narrow screens get plain links.

- **/projects:** two opposing, seamlessly looping bands of small project screenshots, faded into the background at their top and bottom edges. Hovering a band eases it to a crawl (0.1x) while the other keeps moving; leaving restores it. Each screenshot is a link to its project's page, and a focused one slows its band the same way. Only projects that have a screenshot appear; one without a website yet (Karmania) is left out.
- **/blog:** one randomly chosen post (picked on the first hover) with its title and an excerpt that fades into the black; both, and a "Read more →" label under the fade, are one link to the post. The label takes the title's underline fade on hover and focus; the arrow does not move.
- **/about:** the portrait as dense ASCII on a canvas; glyphs are pushed away from the pointer and spring back when it leaves. The whole face, chin, a short stretch of neck, and both shoulders are in the frame (the right one mirrors the left, since the white shirt cannot be told from the white wall).
- **/contact:** three slowly floating 3D logos (GitHub, email, LinkedIn), each a real link.

### Projects Directory

Two category buttons (Software & Apps, Web Development) sit side by side under the centered title, each a 4.4rem Bootstrap Icons glyph (the home contact icon size) on a small glow with only the category name beneath. They are real buttons with `aria-expanded` and `aria-controls`; the open one gets a brighter icon and glow and a thin underline. A category opens its project list with a height animation (`grid-template-rows` from 0fr to 1fr plus a fade); the open one closes when clicked again, and clicking the other switches. Closed lists are `inert`.

Projects are listed one per line with a slash, styled like the navigation links (`/BluLexi`). On fine-pointer desktops, hovering or focusing a project opens a one-line description directly under it in its own 0fr to 1fr row, so the items below slide down and back; a small hover-intent delay keeps a quick sweep calm. A small screenshot (the shared `--shot-width` and `--shot-aspect` tokens, also used by the home marquee) fades in beside the list.

From 64rem up the two categories mirror each other: each list opens under its own toggle (Software & Apps on the left, Web Development on the right) with its text centered on that toggle, and its screenshot on the side facing the middle of the page. Both lists share one grid cell, so switching crossfades in place. Below 64rem there is one centered list. A project that is not launched shows a small WIP badge and, instead of a screenshot, a quiet "Work in progress" panel with its launch note. Touch and narrow screens show every description inline, no screenshot, and navigate on tap.

### Project Page

Each project has its own page laid out exactly like a blog post: the back link, the title, then a quiet technology row (a 1rem logo in a color that reads on black, then the name, never badges or bold; black brand colors become white and Django uses its lighter green; MkDocs is text only), a work-in-progress notice where it applies, sectioned first-person text, and links to the live site, documentation, package, or source, centered as a group (one per line on phones). The page ends with the Keep Reading section.

### Keep Reading

The end of every blog post and project page: a one-pixel Divider Gray rule with a small centered `/`, a quiet label heading ("Keep reading" on posts, "More projects" on projects), then three plain linked rows (the title in the result size, one line of excerpt or tagline beneath), separated by hairlines. Never cards. The three are the next ones after the current page in list order, wrapping at the end: newest-first posts, or the same category's projects. Nothing is random, so a built page never changes, yet the picks differ from page to page.

### Page Subtitle

`/projects` centers a one-line subtitle under its title; `/blog` and `/contact` put one under their left-aligned titles, in the body color and size, never containing a link.

### Social Cards

The image shown when a page is shared is 1200 by 630: black, the site's JetBrains Mono, and the gray radial glow. It is an image, not interface, so the Preview Stage Rule does not apply to it. The landing card (name, site, one line) is shared by every page without an image of its own; each blog post has a card with its title and excerpt; projects with a website use their screenshot. All are made by `scripts/generate-og-images.ts` and committed.

### About Portrait

Below the About text, on phones and desktop, a second photo is drawn as dense ASCII on the shared gray glow (a 34rem-wide square, never wider than the column). Fine pointers push the glyphs away and they spring back; touch screens and reduced motion get the still portrait. The image is prepared offline by `scripts/prepare-portrait.ts`; originals are not stored in the repository.

### Reading Results

Blog results are a plain vertical list with title, excerpt, and date, never cards. Controlled 2.5rem gaps establish rhythm, and titles remain complete rather than truncated.

## Do's and Don'ts

### Do:

- **Do** keep the page ground pitch black and use only the documented neutral hierarchy.
- **Do** preserve the two-column home and centered columns on other pages.
- **Do** use semantic document elements and native controls.
- **Do** keep standalone interactive targets near 2.75rem and show a two-pixel white focus outline.
- **Do** test 320px reflow and long article slugs.
- **Do** keep every preview optional: each destination stays a plain link.

### Don't:

- **Don't** introduce colored accents, or gradients, glows, textures, scanlines, and 3D outside the home preview stage.
- **Don't** add cards, dashboard modules, fake window controls, or decorative chrome.
- **Don't** center paragraph text or vertically center long reading pages.
- **Don't** hide layout defects with global overflow clipping.
- **Don't** make a hover preview the only way to reach content.
