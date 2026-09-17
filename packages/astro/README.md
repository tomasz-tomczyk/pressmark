# @pressmark/astro

Astro components and layouts that render the [@pressmark/theme](https://www.npmjs.com/package/@pressmark/theme) classes. Drop them into any Astro v5+ project.

## Install

```sh
npm install @pressmark/astro @pressmark/theme tailwindcss
```

`@pressmark/theme` is declared as a peer dependency: install it alongside this package. (The theme is published separately so non-Astro consumers can use it standalone — see [@pressmark/theme](https://www.npmjs.com/package/@pressmark/theme).)

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
- `TableOfContents` — `headings: MarkdownHeading[]` (Astro's `render()` output, filtered to h2 internally), `title?`. Progressive-enhancement scroll-spy via `IntersectionObserver`; links still jump to anchors without JS.
- `PostNav` — `prev?: { href, title }`, `next?: { href, title }`. Renders nothing if both are omitted; a missing neighbour renders an empty placeholder to keep the flex layout balanced.
- `DetailList` — `items: { label, value }[]`, `layout?: "inline" | "stacked"`, `labelWidth?`. Label/value rows for colophons, credits and "currently" blocks. `value` may contain inline HTML. `stacked` renders no grid of its own — pass one in `class`.

## Layouts

- `BaseLayout` — `<html>` shell with font links and three named slots: `head`, `sidebar`, and the default slot for main content. No baked-in chrome. Props: `title`, `description?`, `htmlAttrs?`, `bodyClass?`, `favicon?`, `fonts?`.
  - `fonts` — the stylesheet Crimson Pro and IBM Plex Mono load from, defaulting to Google Fonts. A string replaces the URL and drops the Google preconnects with it. Pass `false` to self-host: the default link is render-blocking against an origin the page otherwise never touches, which costs a DNS lookup, a TLS handshake and a round trip before first paint, then the same again on `fonts.gstatic.com` for the files. Declare your own `@font-face` rules for both families — the theme only ever names them through `--font-display` and `--font-body`.
  - `favicon` — a string is the href of a single `<link rel="icon">`; it defaults to Pressmark's own mark so the tab is never blank. Pass `false` when shipping a real icon set (`.ico`, PNG sizes, apple-touch, manifest) and declare the set in the `head` slot instead. Adding those alongside the default rather than replacing it leaves two competing `rel="icon"` links and lets the browser pick.

```astro
<BaseLayout title="Hello" favicon={false}>
  <Fragment slot="head">
    <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
  </Fragment>
</BaseLayout>
```
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
