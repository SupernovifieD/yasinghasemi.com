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

The outer shell is a normal-flow column with a 100rem maximum width, fluid 1.25–2.5rem gutters, and a footer pushed to the bottom only when content is short. Articles, policy pages, About, Contact, and the blog index share a centered 70ch column measured at the reading font size. The blog index stays top-aligned with a `/blog` heading and left-aligned results. About, Contact, and Projects share the same vertically centered short-page layout with a route-name heading above left-aligned compact content; all top-align on phones and short screens.

At 64rem and wider the header is the site name at the left and the four route links (`/projects`, `/blog`, `/about`, `/contact`) at the right, on every page except the home page, which has no header and carries its own navigation. Below 64rem every page, including home, shows the site name with a hamburger button; its panel lists the four links centered. Code and tables may scroll inside their own bounded containers; the document itself must not scroll horizontally.

The home page is two columns from 64rem: the welcome note with the four links below it, one per line, on the left, and the preview stage on the right. Below 64rem it is one column with the same links and no stage.

## Elevation & Depth

The system is flat and uses no shadows, glow, blur, or simulated glass. Hierarchy comes from black surface steps and one-pixel neutral dividers.

### Named Rules

**The Flat Document Rule.** A new surface must earn its boundary through content or interaction; never add card elevation as decoration. The one exception is the Preview Stage.

**The Preview Stage Rule.** A flat gray radial glow, canvas drawing, and WebGL are allowed only inside the home page's desktop preview stage, and nowhere else. The glow is gray (never colored), the same size for every link, and appears on the first hover and then stays. Every animation inside it is reduced or removed under `prefers-reduced-motion`.

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

- **/projects:** two opposing, seamlessly looping bands of small project screenshots, faded into the background at their top and bottom edges.
- **/blog:** one randomly chosen post (picked on the first hover) with its title and an excerpt that fades into the black; both are one link to the post.
- **/about:** the portrait as dense ASCII on a canvas; glyphs are pushed away from the pointer and spring back when it leaves.
- **/contact:** three slowly floating 3D logos (GitHub, email, LinkedIn), each a real link.

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
