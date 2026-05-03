# ColourTokenSystem

## Screen
Welcome (affects all screens — this is a global token and layout change, visible on the app entry point)

## Purpose
Register the full dark-first colour token palette as CSS custom properties in `globals.css`, apply `bg-[var(--color-bg)]` and `text-[var(--color-text)]` to `<body>` in `layout.tsx`, and demonstrate the token system in `page.tsx` with a lavender gradient heading, surface card background, and secondary text.

## Props API

This feature modifies global CSS and two App Router files — `layout.tsx` and `page.tsx`. No new component props are introduced.

| File | Change |
|------|--------|
| `src/app/globals.css` | Register all 16 colour tokens as CSS custom properties; set Nunito font variable; remove old HSL tokens |
| `src/app/layout.tsx` | Replace `bg-background text-foreground` with `bg-[var(--color-bg)] text-[var(--color-text)]`; replace Geist with Nunito |
| `src/app/page.tsx` | Use `--color-lavender/--color-cyan` gradient on heading; `--color-surface` on card wrapper; `--color-sub` on subtitle |

## Variants

### globals.css token set (complete registry)

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#0d0c15` | Page / app background |
| `--color-surface` | `#161428` | Card / panel background |
| `--color-elevated` | `#1e1b32` | Raised elements, inputs, icon buttons |
| `--color-border` | `#2a2640` | All dividers and borders |
| `--color-text` | `#ede9f8` | Primary text |
| `--color-sub` | `#7b72a8` | Secondary / muted text, labels |
| `--color-lavender` | `#a78bfa` | Primary accent — XP bar, buttons, highlights |
| `--color-cyan` | `#22d3ee` | Secondary accent — XP gradient end, mini-game, hygiene bar |
| `--color-hunger` | `#fb923c` | Hunger stat bar |
| `--color-sleep` | `#818cf8` | Sleep stat bar |
| `--color-happy` | `#34d399` | Happiness stat bar |
| `--color-hygiene` | `#22d3ee` | Hygiene stat bar (same as cyan) |
| `--color-pink` | `#f472b6` | Medicine action |
| `--color-yellow` | `#facc15` | Study action |
| `--color-red` | `#ef4444` | Critical state, reset CTA |
| `--font-nunito` | `'Nunito', sans-serif` | Font family variable |

### layout.tsx changes
- `<html>` class: `h-full antialiased` (keep)
- `<body>` class: `min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]`
- Font: replace `Geist` import with `Nunito` at weights 700, 800, 900

### page.tsx changes
- `<h1>`: gradient text from `var(--color-lavender)` to `var(--color-cyan)`, 40px, weight 900
- Card wrapper `<div>`: background `var(--color-surface)`, border-radius 20px, padding 20px
- `<p>` subtitle: color `var(--color-sub)`

## States

- **Default** — dark background (#0d0c15) with light text (#ede9f8)
- **No light mode** — light mode is explicitly out of scope for MVP; no `.dark` class toggle

## Tokens used

All 15 colour tokens plus `--font-nunito`.

## Animation

`fadeInUp` on the heading and card — `0.6s ease` on mount via CSS `@keyframes fadeInUp`.

## Responsive behaviour

- **375px (iPhone SE):** Content centred, padding 24px horizontal; heading wraps gracefully
- **430px (max content width):** Same layout, heading on one line if space allows
- **Wider:** Content caps at 430px max-width centred in viewport

## Accessibility

- Body background/text contrast: `#0d0c15` / `#ede9f8` — contrast ratio ≈ 15:1 (WCAG AAA)
- Gradient heading text must also have a plain text fallback (the text node itself is readable)
- No interactive elements added in this feature

## Do not use for

- Light mode — no `.dark` toggle; tokens are dark-first only
- Dynamic theming — these are static CSS variables wired once in `globals.css`
