# Migrating from Tailwind CSS v3 to v4 + shadcn/ui

A complete guide for upgrading your existing Tailwind v3 project to Tailwind v4 with shadcn/ui integration.

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Phase 1: Remove v3 Artifacts](#phase-1-remove-v3-artifacts)
4. [Phase 2: Install v4 + shadcn/ui](#phase-2-install-v4--shadcnui)
5. [Phase 3: Update Build Configuration](#phase-3-update-build-configuration)
6. [Phase 4: Migrate CSS](#phase-4-migrate-css)
7. [Phase 5: Configure shadcn/ui](#phase-5-configure-shadcnui)
8. [Phase 6: Add Components](#phase-6-add-components)
9. [Troubleshooting](#troubleshooting)
10. [Quick Reference](#quick-reference)

---

## Overview

### What Changes in v4?

| Feature | Tailwind v3 | Tailwind v4 |
|---------|-------------|-------------|
| Config File | `tailwind.config.js/ts` required | **No config file** - CSS-first |
| Entry Point | `@tailwind` directives | `@import "tailwindcss"` |
| Theme Config | JS `theme.extend` | `@theme inline` in CSS |
| Content Paths | Manual `content: [...]` | Automatic detection |
| CSS Variables | `hsl(var(--primary))` | `var(--primary)` in `@layer base` |
| Animation Package | `tailwindcss-animate` | `tw-animate-css` |
| Build Tool | PostCSS plugin | `@tailwindcss/vite` plugin |

### The 4-Step Architecture (v4)

```
Step 1: Define CSS Variables at root level (NOT in @layer)
  ↓
Step 2: Map to Tailwind with @theme inline
  ↓
Step 3: Apply base styles with unwrapped variables
  ↓
Step 4: Automatic dark mode (no dark: variants needed for semantic colors)
```

---

## Pre-Migration Checklist

Before starting, verify your current setup:

```bash
# Check current Tailwind version
npm list tailwindcss

# Note your build tool (Vite, Next.js, etc.)
# Note any customizations in tailwind.config.js
# Note your CSS entry file location
```

**What you'll need:**
- [ ] Node.js 18+ installed
- [ ] Existing Tailwind v3 project
- [ ] 10-15 minutes for migration

---

## Phase 1: Remove v3 Artifacts

### 1.1 Uninstall v3 Packages

```bash
npm uninstall tailwindcss postcss autoprefixer tailwindcss-animate
```

### 1.2 Delete v3 Config Files

```bash
rm tailwind.config.js tailwind.config.ts
rm postcss.config.js  # if it only had Tailwind
```

### 1.3 Remove Old CSS Directives

Delete these from your CSS entry file:

```css
/* DELETE THESE - Old v3 directives */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Phase 2: Install v4 + shadcn/ui

### 2.1 Install Tailwind v4 Packages

```bash
npm install -D tailwindcss @tailwindcss/vite tw-animate-css
```

### 2.2 Initialize shadcn/ui

```bash
npx shadcn@latest init
```

**Answer the CLI prompts:**

| Prompt | Answer |
|--------|--------|
| Style | `new-york` (recommended) |
| Base Color | `neutral`, `slate`, `zinc`, `stone`, or `gray` |
| CSS Variables | `yes` (recommended) |
| TypeScript | `yes` (if using TS) |
| RSC | `yes` (for Next.js App Router) |

---

## Phase 3: Update Build Configuration

### For Vite Projects

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()  // ← Add this (replaces PostCSS)
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### For Next.js Projects

```javascript
// next.config.js
const nextConfig = {
  // Next.js 15+ has built-in Tailwind v4 support
}

module.exports = nextConfig
```

---

## Phase 4: Migrate CSS

### Complete v4 CSS File

Replace your entire CSS entry file with this:

```css
/* src/index.css or app/globals.css */

/* ============================================
   STEP 1: Import Tailwind v4
   ============================================ */
@import "tailwindcss";
@import "tw-animate-css";

/* ============================================
   STEP 2: Define CSS Variables (ROOT LEVEL)
   - Must be at root level, NOT inside @layer
   - Colors wrapped with hsl()
   ============================================ */
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(222.2 84% 4.9%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(222.2 84% 4.9%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(222.2 84% 4.9%);
  --primary: hsl(222.2 47.4% 11.2%);
  --primary-foreground: hsl(210 40% 98%);
  --secondary: hsl(210 40% 96.1%);
  --secondary-foreground: hsl(222.2 47.4% 11.2%);
  --muted: hsl(210 40% 96.1%);
  --muted-foreground: hsl(215.4 16.3% 46.9%);
  --accent: hsl(210 40% 96.1%);
  --accent-foreground: hsl(222.2 47.4% 11.2%);
  --destructive: hsl(0 84.2% 60.2%);
  --destructive-foreground: hsl(210 40% 98%);
  --border: hsl(214.3 31.8% 91.4%);
  --input: hsl(214.3 31.8% 91.4%);
  --ring: hsl(222.2 84% 4.9%);
  --radius: 0.5rem;
}

.dark {
  --background: hsl(222.2 84% 4.9%);
  --foreground: hsl(210 40% 98%);
  --card: hsl(222.2 84% 4.9%);
  --card-foreground: hsl(210 40% 98%);
  --popover: hsl(222.2 84% 4.9%);
  --popover-foreground: hsl(210 40% 98%);
  --primary: hsl(210 40% 98%);
  --primary-foreground: hsl(222.2 47.4% 11.2%);
  --secondary: hsl(217.2 32.6% 17.5%);
  --secondary-foreground: hsl(210 40% 98%);
  --muted: hsl(217.2 32.6% 17.5%);
  --muted-foreground: hsl(215 20.2% 65.1%);
  --accent: hsl(217.2 32.6% 17.5%);
  --accent-foreground: hsl(210 40% 98%);
  --destructive: hsl(0 62.8% 30.6%);
  --destructive-foreground: hsl(210 40% 98%);
  --border: hsl(217.2 32.6% 17.5%);
  --input: hsl(217.2 32.6% 17.5%);
  --ring: hsl(212.7 26.8% 83.9%);
}

/* ============================================
   STEP 3: Map Variables to Tailwind
   - @theme inline maps CSS variables to utilities
   - Enables bg-primary, text-primary, etc.
   ============================================ */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

/* ============================================
   STEP 4: Apply Base Styles
   - Use unwrapped variables (NO hsl())
   - Automatic dark mode switching
   ============================================ */
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Critical Rules

| ❌ NEVER DO | ✅ ALWAYS DO |
|-------------|--------------|
| Keep `tailwind.config.js/ts` | Delete it - v4 doesn't use it |
| Use `@tailwind` directives | Use `@import "tailwindcss"` |
| Use `tailwindcss-animate` | Use `tw-animate-css` |
| Put `:root`/`.dark` inside `@layer base` | Keep at **root level** |
| Use `hsl(var(--primary))` in @layer base | Use `var(--primary)` (unwrapped) |
| Use PostCSS plugin | Use `@tailwindcss/vite` plugin |

---

## Phase 5: Configure shadcn/ui

### components.json (v4 Configuration)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Note:** `"config": ""` (empty string) is REQUIRED for v4.

### Create lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Phase 6: Add Components

### Install Components

```bash
# Add individual components
npx shadcn@latest add button card input dialog dropdown-menu

# Or add all components
npx shadcn@latest add --all
```

### Usage Example

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

### Customizing Components

```tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Direct customization
<Button className="bg-gradient-to-r from-purple-500 to-pink-500">
  Gradient Button
</Button>

// Wrapper component
interface GradientButtonProps extends React.ComponentProps<typeof Button> {
  gradient?: "purple" | "blue" | "green"
}

export function GradientButton({ 
  className, 
  gradient = "purple",
  ...props 
}: GradientButtonProps) {
  const gradients = {
    purple: "from-purple-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
  }
  
  return (
    <Button
      className={cn(
        "bg-gradient-to-r text-white hover:opacity-90",
        gradients[gradient],
        className
      )}
      {...props}
    />
  )
}
```

---

## Troubleshooting

### Issue 1: "Cannot find tailwind.config.ts"

**Cause:** shadcn CLI looking for v3 config

**Solution:** Ensure `components.json` has `"config": ""` (empty string)

---

### Issue 2: Styles not applying

**Cause:** Using old @tailwind directives

**Solution:** Replace with `@import "tailwindcss"`

---

### Issue 3: Dark mode not working

**Cause:** CSS variables in wrong location

**Solution:** Move `:root`/`.dark` outside `@layer base` (at root level)

---

### Issue 4: Colors appear black/white

**Cause:** Double hsl() wrapping in @layer base

**Solution:** 
- In `:root`/`.dark`: Use `hsl(222.2 47.4% 11.2%)`
- In `@layer base`: Use `var(--primary)` (NOT `hsl(var(--primary))`)

---

### Issue 5: Animations not working

**Cause:** Using old tailwindcss-animate

**Solution:** 
```bash
npm uninstall tailwindcss-animate
npm install -D tw-animate-css
```

Then import in CSS:
```css
@import "tw-animate-css";
```

---

### Issue 6: "@apply border-border" not working

**Cause:** Missing @theme inline mapping

**Solution:** Ensure all variables are mapped in `@theme inline`:
```css
@theme inline {
  --color-border: var(--border);
  /* ... all other variables */
}
```

---

## Quick Reference

### Migration Checklist

- [ ] Removed `tailwind.config.js/ts`
- [ ] Uninstalled `tailwindcss`, `postcss`, `autoprefixer`, `tailwindcss-animate`
- [ ] Installed `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`
- [ ] Updated `vite.config.ts` with `tailwindcss()` plugin
- [ ] Replaced `@tailwind` directives with `@import "tailwindcss"`
- [ ] Moved `:root`/`.dark` outside `@layer base`
- [ ] Wrapped colors with `hsl()` in `:root`/`.dark`
- [ ] Added `@theme inline` with all variable mappings
- [ ] Used unwrapped variables in `@layer base`
- [ ] `components.json` has `"config": ""`
- [ ] `lib/utils.ts` exists with `cn()` function
- [ ] Added first shadcn component successfully
- [ ] Dark mode toggle works
- [ ] All existing styles still work

### File Structure (After Migration)

```
project/
├── src/
│   ├── index.css          # v4 CSS with @import, @theme inline
│   ├── components/
│   │   └── ui/            # shadcn components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ...
│   └── lib/
│       └── utils.ts       # cn() helper
├── components.json        # shadcn config ("config": "")
├── vite.config.ts         # Uses @tailwindcss/vite
└── package.json

NO tailwind.config.js/ts   # v4 doesn't use this
NO postcss.config.js       # v4 doesn't use this
```

### v3 vs v4 Quick Comparison

| From (v3) | To (v4 + shadcn) |
|-----------|------------------|
| `tailwind.config.js/ts` | **DELETE** |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `tailwindcss-animate` | `tw-animate-css` |
| PostCSS plugin | `@tailwindcss/vite` plugin |
| `content: [...]` array | Automatic detection |
| `hsl(var(--primary))` in @layer base | `var(--primary)` |
| `darkMode: 'class'` in config | CSS `.dark` class at root |
| `theme.extend` in JS | `@theme inline` in CSS |

---

## New Features in Tailwind v4

### Container Queries (Built-in)

```tsx
<div className="@container">
  <div className="@md:text-lg @lg:grid-cols-2">
    Content responds to container width
  </div>
</div>
```

### 3D Transforms

```tsx
<div className="perspective-[1000px]">
  <div className="rotate-x-12 rotate-y-6 translate-z-8 transform-3d">
    3D transformed element
  </div>
</div>
```

### Logical Properties

```tsx
<div className="inline-64 min-inline-0 max-inline-full">Logical width</div>
<div className="block-32 min-block-screen max-block-none">Logical height</div>
```

---

## Summary

**The 4-Step Architecture (REMEMBER THIS):**

1. **Define CSS Variables** at root level (NOT in @layer) with `hsl()` wrapper
2. **Map to Tailwind** with `@theme inline`
3. **Apply base styles** with unwrapped variables in `@layer base`
4. **Automatic dark mode** - no `dark:` variants needed for semantic colors

**Key Takeaway:**
- v4 is CSS-first - no JS config file
- shadcn/ui works seamlessly with v4
- Follow the 4-step architecture exactly
- Use `@tailwindcss/vite` not PostCSS

---

*Last Updated: 2025 - Compatible with Tailwind CSS v4.x and shadcn/ui latest*
