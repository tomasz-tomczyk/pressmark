# Pressmark

An editorial, paper-bound design system. Tailwind v4 first, with first-class Astro components.

> Six colors, three fonts, no gradients. Hierarchy comes from typography and space, not decoration.

**[Live demo →](https://tomasz-tomczyk.github.io/pressmark/)**

## Packages

| Package | Description |
|---|---|
| [`@pressmark/theme`](./packages/theme) | Tailwind v4 theme — CSS-only, drop-in, one file. |
| [`@pressmark/astro`](./packages/astro) | Astro components & layouts that render the theme classes. |

## Quick start (Tailwind only)

```sh
npm install @pressmark/theme tailwindcss
```

```css
@import "tailwindcss";
@import "@pressmark/theme";
```

## Quick start (Astro)

```sh
npm install @pressmark/astro @pressmark/theme tailwindcss
```

`@pressmark/theme` is a peer dependency — install both. (This lets non-Astro projects use the theme standalone.)

```astro
---
import BaseLayout from "@pressmark/astro/layouts/BaseLayout.astro";
import { Button, Card } from "@pressmark/astro";
---
<BaseLayout title="Hello">
  <Card>
    <Button variant="primary">Read note</Button>
  </Card>
</BaseLayout>
```

## Palette

Tokens name the **role**, not the appearance.

| Token | Hex | Role |
|---|---|---|
| `surface` | `#F6F4EE` | page background |
| `raised` | `#ECE9E2` | cards, badges, code background |
| `line` | `#D9D6CC` | dividers, hairlines |
| `muted` | `#ABA49A` | tiny mono captions only |
| `ink` | `#1F1F1F` | primary text |
| `accent` | `#E05A24` | the one accent |

Plus four **syntax roles**, permitted inside code blocks and nowhere else —
the one exception to "six colours, no others". They are measured against
`raised` (the code background), not `surface`:

| Token | Hex | Role |
|---|---|---|
| `code-string` | `#007E46` | strings, symbols, raw markup |
| `code-function` | `#913F82` | function names and calls |
| `code-number` | `#0465AF` | numerics, language constants |
| `code-variable` | `#007481` | function parameters |

Keywords and types keep `accent`; comments keep `muted`; punctuation is derived
from `ink` rather than taking a token of its own.

Three type tokens — `--font-display` (headings), `--font-body` (prose and UI),
`--font-mono` — filled by two faces: Crimson Pro for the first two, IBM Plex Mono for
the third.

## Re-pointing a role

No component hardcodes a hex, and utilities compile to `var(--color-*)`, so a
role can be re-pointed anywhere in the tree — including at runtime:

```html
<html style="--color-accent: #4a9eff; --font-display: 'Space Grotesk', sans-serif">
```

Pressmark itself ships one palette and one pair of faces. Anything beyond that
is yours to define.

## Upgrading from 0.3.x to 0.5.0

0.4.0 was never published, so 0.3.x upgrades straight to 0.5.0 and gets both
changes at once.

### Breaking: colour tokens renamed (0.4.0)

**No compatibility aliases.** Colour tokens were renamed from appearances to
roles. Rename in your own source:

| ≤ 0.3 | 0.5 |
|---|---|
| `paper` | `surface` |
| `warm-white` | `raised` |
| `stone` | `line` |
| `warm-gray` | `muted` |
| `charcoal` | `ink` |
| `--shadow-paper` | `--shadow-soft` |

This covers both CSS custom properties (`--color-paper` → `--color-surface`) and
the Tailwind classes built from them (`bg-paper` → `bg-surface`, `text-charcoal`
→ `text-ink`, and so on). Colour values did not change.

### Added in 0.4.0

- `Topbar` layout — a horizontal shell beside `Sidebar`, sharing `src/lib/nav.ts`.
- `Hero` — `variant="figure" | "banner"`, `scrimStyle="flat" | "panel" | "gradient"`.
- `AuthorCard` — rail and inline variants, lettered avatar placeholder.
- `--font-display` split from `--font-body` (both still Crimson Pro).
- `BaseLayout` gained `htmlAttrs` and `bodyClass`, so a consumer can re-point
  roles on `<html>`.
- `.dek` utility — the standfirst under a title.

### Added in 0.5.0

- **Four syntax roles** — `--color-code-string`, `--color-code-function`,
  `--color-code-number`, `--color-code-variable`. A documented exception to the
  six-colour rule, permitted inside code blocks only. Before this, strings,
  functions, variables and numbers all resolved to `ink`, so a real post
  rendered in three colours.
- `Badge` gained `variant="meta"` — badge shape at the 13px mono `.meta` step,
  for a chip sitting in a metadata row. It inherits its colour, so it can sit
  inside a link and take the hover.
- `AuthorCard`'s inline byline is one colour and one face; its social links sit
  at the `.meta` grey rather than full ink.
- List bullets are dots in a derived ink tint, not accent em-dashes.

**If you use a custom Shiki theme**, nothing changes — keep passing
`{ tokenColorMap }`. **If you use Pressmark's**, note that every hex in
`shiki.json` must have an entry in `PRESSMARK_SHIKI_TOKEN_MAP`; an unmapped
colour is a literal that ignores your theme, with no build error.

## Anti-goals

- **WCAG AA contrast** is not a target. `muted` on `surface` is 2.24:1; `accent` on `surface` is 3.37:1; `raised` borders are 1.10:1. If you ship Pressmark on a public site, accept this tradeoff or override the relevant tokens.
- **Dark mode** isn't implemented. Tokens are re-pointable (see below), so you
  can define your own dark values — but Pressmark ships one palette, light.
- **Gradients** are banned, except as a legibility scrim behind text over media
  (`Hero` `scrimStyle="gradient"`). Never decorative.

## Development

This is a [Bun workspaces](https://bun.sh/docs/install/workspaces) monorepo.

```sh
bun install
bun run dev        # start the demo site at http://localhost:4321
bun run build      # build the demo site
```

## Publishing

Both packages publish to npm via the `Publish to npm` GitHub Action on release. Trusted publishing (OIDC) — no NPM_TOKEN secret needed once the npm package settings have the GH repo wired up.

## License

MIT
