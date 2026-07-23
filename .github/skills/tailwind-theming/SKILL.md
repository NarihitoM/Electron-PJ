---
name: tailwind-theming
description: "Work with Tailwind CSS v4 theming in the MultimateAi codebase. Use when: adding or modifying design tokens, working with CSS variables and oklch colors, configuring dark mode, adjusting the radius scale, or debugging styling issues."
user-invocable: true
---

# Tailwind CSS v4 Theming

## When to Use

- Adding new design tokens (colors, spacing, radius)
- Modifying the light or dark theme
- Understanding the `oklch()` color system
- Debugging why a Tailwind class isn't applying
- Adding new CSS variables for components

## Theme Architecture

All design tokens are defined in `src/index.css` using Tailwind v4's `@theme inline` directive:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@fontsource-variable/geist";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-heading: var(--font-sans);
  --font-sans: "Geist Variable", sans-serif;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  /* ... all color tokens mapped to CSS variables ... */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}
```

## CSS Variable System

### Light Theme (`:root`)

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
  /* sidebar, card, popover, chart tokens */
}
```

### Dark Theme (`.dark`)

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --muted: oklch(0.269 0 0);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  /* ... mirrored dark values */
}
```

## Using Theme Tokens

In components, use the token names directly — they automatically switch between light/dark:

```tsx
<div className="bg-background text-foreground border-border" />
<button className="bg-primary text-primary-foreground" />
<span className="text-muted-foreground" />
<div className="rounded-lg border border-border" />
```

## The oklch() Color Format

This project uses `oklch()` for all colors — it's more perceptually uniform than HSL/RGB:

```
oklch(lightness chroma hue)
oklch(0.577 0.245 27.325) → red (destructive)
  ↑ lightness (0-1)
       ↑ chroma/saturation
            ↑ hue angle
```

### When to Use `dark:` Prefix

CSS variable-based colors **do not need** `dark:` — they switch automatically:

```tsx
// ✅ These work in both themes:
<div className="bg-background text-foreground" />

// ❌ Unnecessary — the variable already changes in dark mode:
<div className="bg-background dark:bg-background" />
```

Use `dark:` only for **hardcoded values**:

```tsx
// ✅ Needed — hardcoded values don't auto-switch:
<div className="bg-white dark:bg-black" />
<div className="border-gray-200 dark:border-gray-700" />
```

## Custom Scrollbar

The scrollbar thumb color is a plain CSS variable (not in `@theme`):

```css
:root {
  --scroll-thumb: rgb(137, 214, 201); /* teal */
}
.dark {
  --scroll-thumb: #777777; /* gray */
}
```

## Debugging Tips

### Tailwind class not working?

1. Check if the token is defined in `@theme inline` — only those are available as Tailwind utilities
2. Check `index.css` for the `@theme inline` block
3. Run `npm run dev` — Tailwind v4 uses the Vite plugin, no PostCSS config needed

### Color not changing in dark mode?

Ensure the CSS variable is defined in both `:root` and `.dark` blocks. The `@theme inline` mapping is only done once — both themes must set the same variable names.

### Adding a new theme token

1. Add the CSS variable in both `:root` and `.dark` in `src/index.css`
2. Add the mapping in `@theme inline { --color-<name>: var(--<name>); }`
3. Use as `<div className="bg-<name> text-<name>-foreground">`

## Key Files to Reference

- `src/index.css` — all theme tokens, `@theme inline`, `@custom-variant dark`
- `src/shared/lib/utils.ts` — `cn()` utility
- `src/shared/components/ui/button.tsx` — component using theme tokens
