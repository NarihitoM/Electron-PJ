---
description: 'Must-follow rules for creating and modifying shadcn/ui components in the MultimateAi codebase (base-nova style, @base-ui/react primitives, Tailwind v4).'
applyTo: "src/shared/components/ui/**"
---

# UI Components — Rules

## Technology Stack
- **Primitives**: `@base-ui/react` (not native HTML)
- **Variants**: `class-variance-authority` (`cva`)
- **Class merging**: `cn()` from `src/shared/lib/utils.ts` (clsx + tailwind-merge)
- **Icons**: `lucide-react`
- **Styling**: Tailwind CSS v4 (theme variables, NOT hardcoded values)

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

## Checklist

1. **Use `@base-ui/react`** primitive as base element
2. **Define variants** with `cva()` — base styles + variant sets
3. **Export both** component and `variants` function
4. **Add `data-slot`** attribute for scoped styling
5. **Use theme variables** — `bg-primary`, `text-muted-foreground`, `border-border`
6. **Include interactive states** — `hover`, `focus-visible`, `disabled`, `aria-invalid`

## Tailwind v4 Specifics

```typescript
// Focus ring — always use this exact pattern
"focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

// Disabled state
"disabled:pointer-events-none disabled:opacity-50"

// SVG sizing — include in any component that renders icons
"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
```

## Dark Mode

CSS variable-based colors switch automatically — **do not** add `dark:` prefixes for theme tokens:
```tsx
// ✅ CORRECT — switches automatically
<div className="bg-background text-foreground" />

// ❌ WRONG — unnecessary
<div className="bg-background dark:bg-background" />
```

Use `dark:` only for hardcoded values like `dark:border-white/10`.
