---
name: QawayLab Web
description: Editorial laboratory web for QawayLab services and courses
colors:
  primary: "#ff4b0b"
  primary-light: "#ff7a45"
  primary-bright: "#ff9b73"
  ink: "#111111"
  ink-2: "#18181b"
  ink-3: "#1f1f23"
  ink-4: "#27272a"
  muted: "#71717a"
  muted-light: "#a1a1aa"
  surface: "#f5f5f5"
  surface-muted: "#f2f1ef"
  warm: "#efede8"
  warm-muted: "#e5e3dd"
  warm-dark: "#dcd9cf"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  display-condensed:
    fontFamily: "Arial Narrow, Roboto Condensed, Helvetica Neue Condensed, Impact, sans-serif"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
  mono:
    fontFamily: "JetBrains Mono, monospace"
rounded:
  md: "1rem"
  lg: "1.25rem"
  xl: "1.5rem"
spacing:
  sm: "1rem"
  md: "2rem"
  lg: "4rem"
  xl: "8rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "1rem 2rem"
---

# Design System: QawayLab Web

## Overview

**Creative North Star: "The Editorial Laboratory"**

The system reads as a print studio that went digital: warm paper surfaces, near-black ink, and a single acid-orange accent that strikes like a highlighter across editorial spreads. Hierarchy is built from type weight and scale rather than ornament; space is generous; the accent is rationed so it always means "act here." The overall density leans calm and confident, closer to a well-set magazine than a dashboard.

**Key Characteristics:**
- Warm paper / near-black ink pairing with one acid-orange accent reserved for action.
- Editorial display type (Space Grotesk; condensed Arial Narrow on campaign surfaces) over Inter body.
- Flat surfaces that lift on hover; soft corners; glow reserved for primary CTAs.
- Generous, calm spacing; large display scale with tight negative tracking.

## Colors

One accent, warm paper, near-black ink. Accent is the only saturated voice and is rationed.

### Primary
- **Acid Orange** (`#ff4b0b`): the single action color. Used for primary CTAs, active/selected states, and critical highlights only.
- **Acid Light** (`#ff7a45`) / **Acid Bright** (`#ff9b73`): hover and gradient companions to the acid orange.

### Neutral
- **Ink** (`#111111`) + **Ink 2/3/4** (`#18181b`, `#1f1f23`, `#27272a`): dark surfaces, text-on-light, and the dark-mode family.
- **Muted** (`#71717a`) / **Muted Light** (`#a1a1aa`): secondary and tertiary text.
- **Surface** (`#f5f5f5`) / **Surface Muted** (`#f2f1ef`): light section backgrounds.
- **Warm** (`#efede8`) / **Warm Muted** (`#e5e3dd`) / **Warm Dark** (`#dcd9cf`): the warm paper family used on editorial sections.

### Named Rules
**The Acid Ration Rule.** The accent appears on a minority of any screen. Its rarity is what makes it mean "act."

## Typography

**Display Font:** Space Grotesk (with Inter, system-ui fallback)
**Body Font:** Inter (with system-ui fallback)
**Campaign/Condensed Font:** Arial Narrow (with Roboto Condensed, Helvetica Neue Condensed, Impact fallback)
**Label/Mono Font:** JetBrains Mono

**Character:** Editorial and confident. Large display type with tight negative tracking over a calm, highly readable body; condensed sans on campaign and editorial-detail surfaces adds a poster-like voice.

### Hierarchy
- **Display** (400, clamp 2.5rem–4.5rem, 1.05): hero headlines only; tight tracking (-0.03em).
- **Display-md** (400, 3.5rem, 1.08): section intros and page headers.
- **Display-sm** (400, 2.5rem, 1.12): sub-hero headlines and cards.
- **Body** (400, Inter, relaxed leading): article and UI body copy.
- **Label/Mono** (JetBrains Mono, uppercase where used): meta, eyebrows, and technical labels.

## Layout

Calm, generous rhythm. Sections breathe with large vertical padding; content columns stay readable. The site uses standard responsive breakpoints (sm 640, md 768, lg 1024, xl 1280) and collapses asymmetric multi-column layouts to a single column under 768px. Display scale steps down with the viewport.

## Elevation & Depth

Flat by default; depth is expressed through tonal layering (ink on paper) and hover lifts, not resting shadows. Shadows appear as a response to state.

### Shadow Vocabulary
- **Card** (`0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)`): resting cards on light surfaces.
- **Card Hover** (`0 20px 40px rgba(0,0,0,0.08), 0 6px 12px rgba(0,0,0,0.06)`): hover lift for cards.
- **Glow Acid** (`0 0 30px rgba(255,75,11,0.3)`): primary CTA glow; small variant at 0.2 alpha, gold variant layered for hero emphasis.
- **Elevated** (`0 25px 50px -12px rgba(0,0,0,0.25)`): floating panels and overlays.

### Named Rules
**The Flat-By-Default Rule.** Surfaces rest flat. Shadows appear only on hover, elevation, or focus.

## Shapes

Soft corners throughout, scaled from 1rem to 1.5rem. Buttons and cards share the rounded language; the accent is the loudest element, not the geometry.

## Components

### Buttons
- **Shape:** rounded (1rem), generous padding (1rem 2rem)
- **Primary:** acid orange background, white text, glow-accent shadow
- **Hover / Focus:** brightens to acid-light; gentle lift
- **Ghost / Secondary:** border or subtle fill, ink text on paper

### Cards / Containers
- **Corner Style:** rounded (1rem)
- **Background:** surface or warm paper on light; ink family on dark sections
- **Shadow Strategy:** flat at rest, card-hover on hover (see Elevation)
- **Border:** hairline only where structure requires it
- **Internal Padding:** md (2rem)

### Navigation
- **Style:** ink or paper bar with display-weight links; accent on active state
- **Mobile:** collapses to a single line or hamburger under lg

## Do's and Don'ts

### Do:
- **Do** use the acid orange only for action and selection.
- **Do** lead hierarchy with type weight and scale, not color.
- **Do** keep light sections warm paper, dark sections near-black ink.
- **Do** reserve glow for primary CTAs and hero emphasis.

### Don't:
- **Don't** introduce a second saturated accent color.
- **Don't** mix warm and cool grays within the same section.
- **Don't** add resting shadows to flat surfaces.
- **Don't** stack multiple display sizes in one viewport.
