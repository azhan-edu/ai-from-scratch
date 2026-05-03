# Feature Spec: Homepage Heading Text and Color Update

## Summary

Update the `<h1>` element on the main page (`src/app/page.tsx`) to display new text with a green color.

---

## Props API

This is a page component (`HomePage`), not a reusable component. No props.

---

## Variant List

| Variant | Description |
|---------|-------------|
| default | `<h1>` with text "Hello, this is a new text" rendered in green (`text-green-500`) |

No additional variants required for MVP.

---

## State Catalogue

| State | Description |
|-------|-------------|
| static | Page is a Server Component with no interactive state |

---

## Responsive Rules

- Text size remains `text-4xl` at all breakpoints (single-screen layout, centered)
- No breakpoint-specific overrides needed

---

## Dark Mode Variants

- `text-green-500` is sufficiently visible on both light (`bg-white`) and dark (`bg-zinc-900`) surfaces
- No token override required; Tailwind green-500 (`#22c55e`) meets WCAG AA contrast on dark backgrounds

---

## Accessibility States

- `<h1>` is the landmark heading for the page; one per page, correct usage
- No interactive state — no focus, disabled, or ARIA role changes needed
- Color alone does not convey meaning here (decorative color change only)

---

## Component Tree

```
HomePage (Server Component)
  └── <main>
        ├── <h1 class="text-4xl font-bold tracking-tight text-green-500">
        │     "Hello, this is a new text"
        └── <p class="text-lg text-zinc-500">
              "Virtual Pet Companion — ..."
```

---

## Files Affected

- `src/app/page.tsx` — change `<h1>` text and add `text-green-500` class
