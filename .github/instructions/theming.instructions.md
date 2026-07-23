---
description: "Must-follow rules for working with Tailwind CSS v4 theming in the MultimateAi codebase. Covers @theme inline, CSS variables, oklch colors, dark mode, and adding new tokens."
applyTo: "src/**/*.css"
---

# Theming — Rules

## Theme Architecture (`src/index.css`)

All design tokens are in `src/index.css` using `@theme inline`:

```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
}
```

## CSS Variable System

### Light (`:root`) and Dark (`.dark`) MUST define the same variables

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}
```

Both blocks **must** set the same variable names. The `@theme inline` mapping is only done once.

## oklch() Color Format

```css
oklch(lightness chroma hue)
oklch(0.577 0.245 27.325)
  ↑ lightness (0-1)
       ↑ chroma/saturation
            ↑ hue angle
```

Always use `oklch()` — never HSL, RGB, or hex in theme variables.

## When to Use `dark:` Prefix

| Scenario         | Example                 |      Prefix Needed?       |
| ---------------- | ----------------------- | :-----------------------: |
| Theme variable   | `bg-background`         |     ❌ auto-switches      |
| Theme variable   | `text-muted-foreground` |     ❌ auto-switches      |
| Hardcoded value  | `bg-white`              |    ✅ `dark:bg-black`     |
| Hardcoded border | `border-gray-200`       | ✅ `dark:border-gray-700` |
| Opacity modifier | `border-white/10`       |       ✅ only dark        |

## Adding a New Theme Token

1. Add CSS variable in **both** `:root` and `.dark` in `src/index.css`
2. Add mapping in `@theme inline { --color-<name>: var(--<name>); }`
3. Use as `<div className="bg-<name> text-<name>-foreground">`

## Debugging

- **Token not working?** Check it's defined in `@theme inline` — only those are available as Tailwind utilities
- **Color not switching in dark mode?** Check both `:root` and `.dark` define the same variable name
- **Tailwind v4** uses the Vite plugin (`@tailwindcss/vite`), not PostCSS — no `postcss.config.js`
