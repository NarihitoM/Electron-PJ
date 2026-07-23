---
name: shadcn-ui-component
description: "Create or modify shadcn/ui components in the MultimateAi codebase (base-nova style, @base-ui/react primitives, Tailwind v4). Use when: building a new UI primitive, adding variants to existing components, or fixing styling inconsistencies."
user-invocable: true
---

# shadcn/ui Component Creation

## When to Use

- Adding a new reusable UI component to `src/shared/components/ui/`
- Extending an existing component with new variants
- Understanding the cva + cn + Tailwind v4 pattern

## Technology Stack

| Tool                       | Usage                                     |
| -------------------------- | ----------------------------------------- |
| `@base-ui/react`           | Primitives (Button, Dialog, Select, etc.) |
| `class-variance-authority` | Component variant definitions             |
| `clsx` + `tailwind-merge`  | Class merging via `cn()` helper           |
| Tailwind CSS v4            | Utility-first styling                     |
| `lucide-react`             | Icons                                     |

## cn() Utility

Defined in `src/shared/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Always use `cn()` for combining class names — it handles conflicts and conditional classes.

## Component Template

```typescript
import { Component as ComponentPrimitive } from "@base-ui/react/component"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const componentVariants = cva(
  // Base styles — always present
  "inline-flex items-center rounded-lg text-sm font-medium transition-all outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground",
      },
      size: {
        default: "h-8 px-3",
        sm: "h-7 px-2 text-xs",
        lg: "h-9 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Component({
  className,
  variant,
  size,
  ...props
}: ComponentPrimitive.Props & VariantProps<typeof componentVariants>) {
  return (
    <ComponentPrimitive
      data-slot="component"
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Component, componentVariants }
```

## Tailwind v4 Specifics

This codebase uses **Tailwind CSS v4** (not v3). Key differences:

### Theme Variables

Defined in `src/index.css` using `@theme inline`:

```css
@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --radius-sm: calc(var(--radius) * 0.6);
}
```

Refer to theme variables as `bg-primary`, `text-primary-foreground`, `rounded-sm`.

### Dark Mode

```css
@custom-variant dark (&:is(.dark *));
```

Use `.dark` class-based dark mode. Components don't need `dark:` prefixes for CSS variables — they switch automatically. Use `dark:` only for hardcoded values like `dark:border-white/10`.

### Focus Ring Pattern

```typescript
"focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
```

### Disabled State

```typescript
"disabled:pointer-events-none disabled:opacity-50";
```

### SVG Sizing

```typescript
"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
```

## Component Checklist

When creating a new component:

1. **Use `@base-ui/react`** primitive as the base element (not native HTML)
2. **Define variants** with `cva()` — base styles + variant sets
3. **Export both** the component and the `variants` function
4. **Add `data-slot`** attribute for scoped styling
5. **Use theme variables** — `bg-primary`, `text-muted-foreground`, `border-border`
6. **Include all interactive states** — `hover`, `focus-visible`, `disabled`, `aria-invalid`

## Component Location

All UI primitives go in `src/shared/components/ui/`:

```
src/shared/components/ui/
├── button.tsx
├── dialog.tsx
├── input.tsx
├── card.tsx
├── badge.tsx
├── ...
```

## Reference Components

- `src/shared/components/ui/button.tsx` — the canonical example (cva + base-ui + cn)
- `src/shared/components/ui/badge.tsx` — simple variant example
- `src/shared/components/ui/dialog.tsx` — compound component with animations
- `src/shared/components/ui/sidebar.tsx` — complex compound component
