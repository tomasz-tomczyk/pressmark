# @pressmark/astro

Astro components and layouts that render the [@pressmark/theme](https://www.npmjs.com/package/@pressmark/theme) classes. Drop them into any Astro v5+ project.

## Install

```sh
npm install @pressmark/astro tailwindcss
```

`@pressmark/theme` is installed transitively; you don't need to add it to your package.json.

In your Tailwind v4 entry CSS, import the theme **and** tell Tailwind to scan this package's components so the `.badge`, `.card`, `.nav-item`, `.panel-label`, `.section-label`, and `.prose-pressmark` utilities get emitted:

```css
@import "tailwindcss";
@import "@pressmark/theme";

@source "../../node_modules/@pressmark/astro/src/**/*.astro";
```

(Adjust the relative path to match where your entry CSS lives. From `apps/<project>/src/styles/main.css`, two levels up reaches `node_modules/`.)

## Use

```astro
---
import { BaseLayout, Sidebar, Button, Card } from "@pressmark/astro";

const items = [
  { href: "/", label: "Home" },
  { href: "/notes", label: "Notes" },
  { href: "/about", label: "About" },
];
---

<BaseLayout title="Hello">
  <Sidebar slot="sidebar" brand="/yourname." items={items} currentPath={Astro.url.pathname} />

  <main class="ml-[260px] px-12 py-10">
    <Card>
      <h2>A note</h2>
      <Button variant="primary">Read</Button>
    </Card>
  </main>
</BaseLayout>
```

## Components

- `Button` — `variant?: "primary" | "secondary" | "link"`, `as?: "button" | "a"`, `href?`. Compose with `class="btn-sm"` for a 32 px height variant.
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

- `BaseLayout` — `<html>` shell with font links and two named slots: `sidebar` and the default slot for main content. No baked-in chrome.
- `Sidebar` — Editorial-style fixed left sidebar. Takes `items: SidebarItem[]`, optional `brand`, and a default slot for extras (search, theme toggle, image, quote, etc.). `SidebarItem` shape: `{ href, label, icon? }`, where `icon` is raw SVG inner content (paths/rects/circles).

## Content collections

```ts
// src/content/config.ts
import { defineCollection } from "astro:content";
import { postSchema } from "@pressmark/astro/content/schema";

export const collections = {
  posts: defineCollection({ type: "content", schema: postSchema }),
};
```

## License

MIT
