# @pressmark/astro

Astro components and layouts that render the [@pressmark/theme](https://www.npmjs.com/package/@pressmark/theme) classes. Drop them into any Astro v5+ project.

## Install

```sh
npm install @pressmark/astro @pressmark/theme tailwindcss
```

In your Tailwind v4 entry CSS:

```css
@import "tailwindcss";
@import "@pressmark/theme";
```

## Use

```astro
---
import BaseLayout from "@pressmark/astro/layouts/BaseLayout.astro";
import { Button, Badge, Card } from "@pressmark/astro";
---

<BaseLayout title="Hello">
  <Card>
    <h2>A note</h2>
    <p>With <Badge>tags</Badge> and a <Button variant="primary">button</Button>.</p>
  </Card>
</BaseLayout>
```

## Components

- `Button` — `variant: "primary" | "secondary" | "link"`, `as?: "button" | "a"`, `href?`
- `Badge` — `variant?: "default" | "mono"`
- `Card` — slotted surface
- `NavItem` — `href`, `active?`, `icon` slot + default slot
- `PanelLabel` — tiny mono caption
- `SectionLabel` — accent display heading
- `Hairline` — single-pixel divider
- `Prose` — long-form article wrapper, `dropcap?: boolean`
- `Checkbox` — styled checkbox input
- `Progress` — `value: number` (0–100)

## Layouts

- `BaseLayout` — `<html>`, font links, sidebar slot, main slot
- `PostLayout` — three-column with TOC right rail, post frontmatter

## License

MIT
