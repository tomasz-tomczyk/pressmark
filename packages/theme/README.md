# @pressmark/theme

An editorial, paper-bound Tailwind v4 design-system theme. CSS-only. One file. No build step.

## Install

```sh
npm install @pressmark/theme tailwindcss
```

## Use

In your Tailwind v4 entry CSS:

```css
@import "tailwindcss";
@import "@pressmark/theme";
```

Load the fonts in your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300..700;1,300..700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap">
```

That's it. Use any of the Pressmark utilities and components alongside vanilla Tailwind.

## Palette

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F6F4EE` | main background |
| `warm-white` | `#ECE9E2` | soft surfaces, badges, borders |
| `stone` | `#D9D6CC` | dividers, soft surfaces |
| `warm-gray` | `#ABA49A` | tiny mono captions only |
| `charcoal` | `#1F1F1F` | primary text, dark surfaces |
| `accent` | `#E05A24` | the one accent |

All text is `charcoal` except the `accent`. No gradients. No 7th color.

## Components

`.btn` / `.btn-primary` / `.btn-secondary` / `.btn-link`, `.badge` / `.badge-mono`,
`.card`, `.hairline`, `.nav-item`, `.panel-label`, `.section-label`, `.checkbox`,
`.progress` + `.progress-fill`, `.prose-pressmark` + `.dropcap`.

Inline `<code>` gets backticks and a warm-white pill automatically.

## Override

Re-declare any token in your own `@theme` block **after** the import:

```css
@import "tailwindcss";
@import "@pressmark/theme";

@theme {
  --color-accent: #2E5BFF;
}
```

## Astro?

There's a sister package `@pressmark/astro` with prop-driven components and layouts
that render these classes. Either is usable standalone.

## License

MIT
