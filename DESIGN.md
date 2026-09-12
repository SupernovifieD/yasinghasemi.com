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
    fontSize: "clamp(1.875rem, 4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "JetBrains Mono, ui-monospace, DejaVu Sans Mono, Liberation Mono, monospace"
    fontSize: "clamp(1.35rem, 1.2rem + 0.55vw, 1.65rem)"
    fontWeight: 700
    lineHeight: 1.22
  title:
    fontFamily: "JetBrains Mono, ui-monospace, DejaVu Sans Mono, Liberation Mono, monospace"
    fontSize: "clamp(1.2rem, 1.08rem + 0.45vw, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "JetBrains Mono, ui-monospace, DejaVu Sans Mono, Liberation Mono, monospace"
    fontSize: "clamp(1rem, 0.95rem + 0.2vw, 1.0625rem)"
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
  command-input:
    backgroundColor: "{colors.page-black}"
    textColor: "{colors.primary-white}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0.5rem 0"
  terminal-submit:
    backgroundColor: "{colors.page-black}"
    textColor: "{colors.primary-white}"
    rounded: "{rounded.square}"
    height: "2.75rem"
    width: "2.75rem"
  navigation-link:
    backgroundColor: "{colors.page-black}"
    textColor: "{colors.body-gray}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    height: "2.75rem"
---

# Design System: yasinghasemi.com

## Overview

**Creative North Star: "The Quiet Shell Manual"**

The site combines the economy of a Unix manual page with the calm pacing of a small literary publication. Pitch black is the canvas, neutral text carries every hierarchy, and shell notation appears only where it explains navigation. The result should feel authored and technical without becoming a terminal emulator, dashboard, or hacker-film prop.

The writing is always the product. Layout, controls, and responsive behavior protect reading and ordinary navigation before expressing the shell motif.

**Key Characteristics:**

- Absolute black ground with a neutral gray-to-white hierarchy.
- One self-hosted monospace family and no decorative type pairing.
- Flat, square, line-based controls without cards or ornamental surfaces.
- Distinct center-left, left-index, and centered-reading geometries.
- Progressive enhancement: conventional links remain complete without the shell.

## Colors

The palette is strictly achromatic; contrast and typography, not hue, communicate state.

### Primary

- **Primary White:** Highest-emphasis headings, links, active states, caret, and focus.

### Neutral

- **Page Black:** Default page and control ground.
- **Panel Black:** Subtle bounded code and transcript surfaces.
- **Hover Black:** Quiet hover fill on compact controls.
- **Divider Gray:** Decorative rules and resting control borders; never the sole control indicator.
- **Body Gray:** Long-form copy and normal shell text.
- **Muted Gray:** Dates, hints, transcript commands, and footer copy.
- **Outline Gray:** Interactive control borders when stronger definition is needed.

### Named Rules

**The No Accent Rule.** State is expressed with weight, underline, border, and white focus treatment; never introduce a chromatic accent.

**The Readability Rule.** Muted text remains real readable text, not low-opacity decoration.

## Typography

- **Display Font:** JetBrains Mono with the project monospace fallback chain
- **Body Font:** JetBrains Mono with the project monospace fallback chain
- **Label/Mono Font:** JetBrains Mono with the project monospace fallback chain

**Character:** The single-family system is direct and technical, with normal prose rhythm rather than preformatted terminal density. Programming ligatures remain disabled so shell punctuation is literal.

### Hierarchy

- **Display** (700, fluid 1.875–2.5rem, 1.2): Homepage, Contact, and primary page headings.
- **Headline** (700, fluid 1.35–1.65rem, 1.22): Long-form section headings.
- **Title** (700, fluid 1.2–1.5rem, 1.35): Blog result titles.
- **Body** (400, fluid 1–1.0625rem, 1.78): Reading columns constrained to about 70 characters.
- **Label** (400, 0.875rem, 1.55): Terminal output, hints, and footer metadata.

### Named Rules

**The Prose Is Not a Terminal Rule.** Use semantic paragraphs and natural wrapping; never turn articles into a preformatted text wall.

## Layout

The outer shell is a normal-flow column with a 72rem maximum width, fluid 1.25–4rem gutters, and a footer pushed to the bottom only when content is short. Reading pages use a centered 70ch column. The blog index occupies up to 82ch at the left of the outer container. Home and Contact use a center-left block inset by up to 4rem and vertically center only when viewport height permits.

At 40rem and below, primary navigation becomes the first full-width row and the terminal prompt follows beneath it. Header input and path content use intrinsic sizing and wrapping rather than clipped overflow. Code, tables, and the transcript may scroll inside their own bounded containers; the document itself must not scroll horizontally.

## Elevation & Depth

The system is entirely flat and uses no shadows, gradients, glow, blur, or simulated glass. Hierarchy comes from black surface steps and one-pixel neutral dividers.

### Named Rules

**The Flat Document Rule.** A new surface must earn its boundary through content or interaction; never add card elevation as decoration.

## Shapes

Controls and bounded content use square corners. One-pixel rules, underlines, and the compact return-key button supply the recurring geometry. Rounded pills, badges, chips, and fake terminal-window chrome do not belong in this system.

## Components

### Buttons

- **Shape:** Square and compact, with a minimum 2.75rem touch dimension.
- **Primary:** Transparent black ground, neutral one-pixel border, white text.
- **Hover / Focus:** Hover strengthens the border and applies the quiet hover surface; keyboard focus uses the shared two-pixel white outline.

### Inputs / Fields

- **Style:** Native editable text input on a transparent ground with a restrained bottom rule and a visible white caret.
- **Focus:** The shared white focus outline remains visible; native selection and editing behavior are preserved.
- **Error / Disabled:** Errors appear as selectable transcript text. Pending navigation temporarily disables the field and return control.

### Navigation

Primary navigation is a row of literal route links. Hover and active states brighten the text and reveal a thin underline; active state is also carried semantically with `aria-current`. At narrow widths the full set stays visible above the prompt.

### Terminal Transcript

The transcript is an in-flow, selectable region below the header. It collapses when empty and caps its height at the lesser of 14rem or 35svh. Long output wraps, while the region itself remains keyboard-focusable and vertically scrollable.

### Reading Results

Blog results are a plain vertical list with title, excerpt, and date—never cards. Controlled 2.5rem gaps establish rhythm, and titles remain complete rather than truncated.

## Do's and Don'ts

### Do:

- **Do** keep the page ground pitch black and use only the documented neutral hierarchy.
- **Do** preserve the distinct home, index, and article alignments.
- **Do** use semantic document elements and native controls.
- **Do** keep standalone interactive targets near 2.75rem and show a two-pixel white focus outline.
- **Do** test 320px reflow, long prompt paths, and long article slugs.

### Don't:

- **Don't** introduce colored accents, gradients, glows, textures, scanlines, or CRT effects.
- **Don't** add cards, dashboard modules, fake window controls, or decorative terminal chrome.
- **Don't** center paragraph text or vertically center long reading pages.
- **Don't** hide layout defects with global overflow clipping.
- **Don't** make the shell the only way to reach content.
