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

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F6F4EE` | main background |
| `warm-white` | `#ECE9E2` | soft surfaces, badges |
| `stone` | `#D9D6CC` | dividers |
| `warm-gray` | `#ABA49A` | tiny mono captions only |
| `charcoal` | `#1F1F1F` | primary text |
| `accent` | `#E05A24` | the one accent |

## Anti-goals

- **WCAG AA contrast** is not a target. Warm-gray on paper is 2.24:1; accent on paper is 3.37:1; warm-white borders are 1.10:1. If you ship Pressmark on a public site, accept this tradeoff or override the relevant tokens.
- **Dark mode** isn't implemented.
- **Gradients** are banned.

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
