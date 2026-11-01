---
name: Dosnoventa Fixed Gear Bicycles
description: Stark industrial track precision meets high-fashion European atelier restraint.
colors:
  primary: "#c83226"
  primary-hover: "#a8251b"
  neutral-bg: "#f8f8fa"
  neutral-surface: "#ffffff"
  neutral-text: "#121417"
  neutral-subtle: "#e5e7eb"
  dark-bg: "#0a0b0d"
  dark-surface: "#121417"
  dark-text: "#f6f5f1"
  dark-subtle: "#24272e"
  accent-slate: "#4b5563"
  accent-blue: "#2563eb"
  accent-neon: "#65a30d"
typography:
  display:
    fontFamily: "'Syne', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.02em"
  body:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.16em"
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.neutral-text}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.none}"
    padding: "16px 36px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.none}"
    padding: "16px 36px"
  input-field:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.none}"
    padding: "16px 20px"
---

# Design System: Dosnoventa Fixed Gear Bicycles

## Overview

**Creative North Star: "The Barcelona Velodrome Atelier"**

The Dosnoventa design language unites the uncompromising mechanical precision of a track bike with the stark typographical restraint of modern European art direction. Interfaces are constructed like high-grade bicycle frames: zero ornamental excess, razor-sharp geometric cuts, generous negative space, and relentless structural clarity. Every element exists to communicate engineering truth, velocity, and craftsmanship.

The system lives across two synchronized atmospheres: a crisp, clinical Light Mode canvas (`#f8f8fa`) that evokes clean European architectural ateliers by day, and an immersive Dark Mode canvas (`#0a0b0d`) recalling asphalt night alleycats and indoor velodromes. The signature Racing Scarlet accent (`#c83226`) is used sparingly as a high-velocity signal flare for interactive focal points, badges, and state transitions.

**Key Characteristics:**
- **Zero-Radius Architecture:** Strict 0px to 4px corners; eschews friendly rounded pills in favor of industrial precision.
- **Micro-Tracked Hierarchy:** Uppercase sans-serif headers paired with generous letter spacing (`0.12em` to `0.18em`) for metadata and labels.
- **Tactile High-Contrast Planes:** Pure white and rich charcoal cards separated by 1px hairline dividers rather than heavy drop shadows.
- **Mechanical Restraint:** Color is deployed with mathematical precision; scarlet accent coverage remains under 10% of any given view.

## Colors

The palette balances clean architectural neutrals with an electrifying flash of racing scarlet.

### Primary
- **Racing Scarlet** (`#c83226`): The primary velocity beacon. Used strictly for active category pills, CTA hover states, live badges, and critical notification signals.

### Secondary
- **Architectural Slate** (`#4b5563`): Secondary technical annotations, specs, and quiet interactive states.
- **Track Blue** (`#2563eb`): Status badge indicator for active bike assembly and verified mechanical steps.
- **Acid Chartreuse** (`#65a30d`): High-visibility accent reserved for stock availability and dispatch confirmations.

### Neutral
- **Studio Off-White** (`#f8f8fa`): The default daytime background surface; warm, clean, anti-glare canvas.
- **Pure Module White** (`#ffffff`): Card faces, configurator spec sheets, and dialog surfaces in light mode.
- **Rich Charcoal** (`#121417`): Primary text color in light mode and solid primary button fills.
- **Velodrome Obsidian** (`#0a0b0d`): Deep nocturnal background base for dark mode.
- **Hairline Divider** (`#e5e7eb`): 1px structural grid lines and module boundaries.

### Named Rules
**The Ten-Percent Flare Rule.** The Racing Scarlet accent (`#c83226`) must never dominate a layout. It is a high-speed brake-light signal used on ≤10% of any surface to guide the eye directly to action.

**The Dual-Atmosphere Rule.** Backgrounds and surfaces must cleanly swap between Light (`#f8f8fa`) and Dark (`#0a0b0d`) via CSS custom properties without modifying structural hierarchy or layout integrity.

## Typography

**Display Font:** `Syne`, -apple-system, BlinkMacSystemFont, sans-serif
**Headline & Label Font:** `Space Grotesk`, -apple-system, BlinkMacSystemFont, sans-serif
**Body Font:** `Inter`, -apple-system, BlinkMacSystemFont, sans-serif

**Character:** Technical, European, and uncompromising. Geometric display headlines cut with bold mechanical lines, paired with neutral humanist body copy for effortless readability across technical specifications.

### Hierarchy
- **Display** (800 weight, `clamp(2.5rem, 6vw, 5rem)`, 0.95 line-height, `-0.04em` tracking): Hero banners, editorial mastheads, and model titles.
- **Headline** (700 weight, `clamp(1.75rem, 3.5vw, 2.75rem)`, 1.1 line-height, `-0.02em` tracking): Section headers, collection introductions, and major feature titles.
- **Title** (600 weight, `1.25rem`, 1.25 line-height, `0.02em` tracking): Product card names, checkout group titles, and modal headers.
- **Body** (400 weight, `0.95rem`, 1.6 line-height, normal tracking): Product descriptions, customer reviews, and editorial paragraphs. Max line length strictly 65–75ch.
- **Label** (600 weight, `0.72rem`, 1.2 line-height, `0.16em` tracking, uppercase): Specs, categories, badges, table headers, and pricing subtext.

### Named Rules
**The Strict Uppercase Metadata Rule.** All labels, categories, badges, and button labels must be rendered in uppercase with `0.12em` to `0.18em` tracking. Body copy and reviews remain in standard sentence casing.

## Layout

Layouts follow an asymmetric editorial grid built around wide containers (`max-width: 1440px` and `1720px`). Sections breathe with expansive vertical rhythm (`2rem` to `8rem` padding). 

- **Grid:** 12-column responsive layout with `24px` gutter on desktop, condensing to 2-column or single-column stack on mobile viewports (`<768px>`).
- **Edge Restraint:** Side margins scale smoothly using `clamp(1.25rem, 4vw, 3.5rem)` so full-bleed editorial imagery never touches screen borders awkwardly.
- **Density:** High density for technical data tables and component spec sheets; airy, generous spacing for bike collection galleries and mastheads.

## Elevation & Depth

Dosnoventa rejects ambient heavy drop shadows. Depth is communicated structurally through **tonal planes** and **1px hairline borders**.

- **At-Rest State:** Completely flat (`box-shadow: none`). Surfaces sit directly on the studio canvas or card plane separated by hairline borders (`#e5e7eb` or `rgba(246, 245, 241, 0.08)`).
- **Elevated / Hover State:** A crisp 1px hairline border darkening or light accent shift, accompanied by a subtle physical lift (`transform: translateY(-2px)`).
- **Modal & Drawer Overlay:** Backdrops utilize a frosted glass blur (`backdrop-filter: blur(12px)`) with a dark translucent tint (`rgba(10, 11, 13, 0.7)`).

### Named Rules
**The Flat Plane Rule.** Never apply diffuse multi-layered drop shadows (`0 20px 40px rgba(0,0,0,0.15)`) to product cards or containers. Depth belongs to the photography and crisp 1px borders, not artificial blur.

## Shapes

- **Corner Radius:** Zero radius (`0px`) is the baseline standard for primary buttons, inputs, table cells, and hero cards. Subtle micro-radii (`4px`) are permitted solely on badges, pills, and standalone notification cards.
- **Borders:** Crisp, 1px solid hairline borders. No dashed, dotted, or thick multi-pixel outlines unless indicating keyboard focus.
- **Silhouettes:** Sharp rectangular frames that frame bike geometry without rounding off structural edges.

## Components

### Buttons
- **Shape:** Sharp rectangular corners (`rounded: 0px`).
- **Primary:** High-contrast solid fill (`#121417` in light mode, `#f6f5f1` in dark mode) with inverted bold label text, `1.1rem 2.2rem` padding, uppercase tracked text.
- **Hover:** Immediate background inversion or transition to Racing Scarlet (`#c83226`) with a physical `translateY(-2px)` lift.
- **Outline / Ghost:** Transparent background with a 1px border (`#121417` or `#e5e7eb`), filling on hover.

### Chips & Badges
- **Shape:** Compact rectangular pill with micro-radius (`4px`).
- **Style:** Translucent dark or white backdrop with a 1px hairline border.
- **Indicator:** Inset 6px circular dot (`#c83226`) preceding active status or verified buyer label.

### Cards & Modules
- **Shape:** Flush rectangular containers (`rounded: 0px`).
- **Background:** Pure white (`#ffffff`) in light mode; surface obsidian (`#121417`) in dark mode.
- **Border:** 1px hairline border (`#e5e7eb` / `rgba(246, 245, 241, 0.08)`).
- **Internal Padding:** `1.5rem` to `2.5rem`.

### Technical Form Inputs
- **Shape:** Square corners (`rounded: 0px`).
- **Stroke & Background:** 1px hairline border with `#ffffff` (light mode) or `#16181d` (dark mode) background.
- **Focus:** Sharp 1px solid ring shift matching text primary, zero fuzzy glow.
- **Error:** 1px solid Racing Scarlet (`#c83226`) with concise technical error text.

### Navigation
- **Header:** Sticky top bar with frosted glass backdrop (`backdrop-filter: blur(16px)`).
- **Links:** Tracked uppercase links (`0.14em`), shifting color on hover with an animated 2px underline or dot indicator.
- **Theme Toggle:** Circular icon toggle smoothly transitioning between Sun and Moon SVGs with instant theme attribute application.

## Do's and Don'ts

### Do:
- **Do** maintain sharp 0px corners on primary CTAs, inputs, and collection cards.
- **Do** keep typography hierarchy disciplined: `Syne` for display, `Space Grotesk` for titles & labels, `Inter` for body copy.
- **Do** use Racing Scarlet (`#c83226`) exclusively as an intentional velocity accent, never as a full-page background flood.
- **Do** write concise, technical, and authentic cycling copy (Columbus Spirit tubing, 144 BCD, 7005 Airplane aluminum).
- **Do** preserve 100% feature parity between Light Mode and Dark Mode.

### Don't:
- **Don't** use playful rounded bubble buttons or soft pill corners (`rounded-full` or `rounded-2xl`).
- **Don't** use fuzzy, floating drop shadows to simulate elevation; use 1px borders and surface color shifts.
- **Don't** use generic decorative illustrations, emojis, or stock icons that contradict track cycling reality.
- **Don't** mix more than two accent colors on any single viewport.
- **Don't** allow long lines of text to exceed 75 characters without column wrapping.
