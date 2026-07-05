# CLAUDE.md — Pressmark

An editorial, paper-bound design system. Two published npm packages plus an Astro demo deployed to GitHub Pages.

## What this is

| | |
|---|---|
| Repo | https://github.com/tomasz-tomczyk/pressmark |
| Demo | https://tomasz-tomczyk.github.io/pressmark/ |
| `@pressmark/theme` | Tailwind v4 theme — single CSS file, drop-in; a few components layer in minimal progressive-enhancement JS |
| `@pressmark/astro` | Astro v5 components & layouts that render the theme classes |

Originally called "Vellum" — the user may still refer to it that way colloquially. The published name is "Pressmark" because npm reserved `@vellum` and several other editorial nouns (see `~/.claude/projects/-Users-tomasztomczyk-Server-side/memory/project_pressmark_naming.md`).

## Repo layout

```
pressmark/
├── package.json              # bun workspaces root (private)
├── packages/
│   ├── theme/                # @pressmark/theme
│   │   ├── pressmark.css     # the theme — tokens + @utility + @layer components
│   │   └── README.md
│   └── astro/                # @pressmark/astro
│       └── src/
│           ├── components/   # Button, Badge, Card, NavItem, Prose, Checkbox, etc.
│           ├── layouts/      # BaseLayout, PostLayout, Sidebar
│           └── content/      # schema.ts (zod content-collection schema)
├── apps/
│   └── demo/                 # Astro app — deployed to GH Pages
│       ├── astro.config.mjs  # base: "/pressmark" in prod, "/" in dev
│       └── src/
│           ├── pages/        # index, post, about, components, system
│           └── styles/main.css   # @import tailwindcss + @pressmark/theme
├── .github/workflows/
│   ├── ci.yml                # build on push/PR
│   ├── pages.yml             # deploy demo to GH Pages on push to main
│   └── publish.yml           # publish both packages on GH release (OIDC trusted)
└── .legacy-html/             # ORIGINAL HTML pages, kept locally as diff target; gitignored
```

## Commands

```sh
bun install                # install all workspace deps
bun run dev                # demo at http://localhost:4321
bun run build              # static build into apps/demo/dist/

# Publishing — Trusted Publishing (OIDC) via GitHub Actions, no OTP.
# Bump both package.json versions, commit, then cut a release:
gh release create v0.3.0 --title "v0.3.0" --notes "..."   # → .github/workflows/publish.yml publishes BOTH
# Or publish one package manually:
gh workflow run publish.yml -f package=theme   # theme | astro | both
```

The root scripts use `bun --filter=demo run <script>` — note the explicit `run`; without it, bun interprets `build`/`dev` as its own bundler subcommand.

## Design constraints — NON-NEGOTIABLE

These are user-enforced rules. Re-deriving them ourselves doesn't fly.

### Palette — exactly six colors, no others

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F6F4EE` | main background |
| `warm-white` | `#ECE9E2` | soft surfaces, badges, soft borders |
| `stone` | `#D9D6CC` | dividers, soft surfaces |
| `warm-gray` | `#ABA49A` | TINY MONO CAPTIONS ONLY |
| `charcoal` | `#1F1F1F` | primary text, dark surfaces |
| `accent` | `#E05A24` | the one accent |

- Never introduce a 7th hex. Compose from the six.
- For a "muted text" effect, don't add a new gray — use font-size/weight to drop hierarchy.
- For a "soft accent" background, use `bg-accent/15` or `/25`, not a new color.

### Text rules
- **All text is `charcoal`** except links/CTAs in `accent`.
- `warm-gray` is **reserved for the smallest mono captions** (`panel-label`, dataset codes). Don't use it for body copy or muted text — that's a Skill DON'T trap.

### Fonts — two only
- **Crimson Pro** (display + UI/body, variable, 300–700) — the whole UI is serif; there is no separate sans typeface (no `--font-sans` token). Everything uses `--font-display`. Type scale: prose/article body **21px**; all UI text **18px** (base body, nav, buttons, descriptions, ToC, metadata). Serif reads optically smaller than a sans. Reading column is 46rem; `.wide-media` breaks media out to 54rem.
- **DM Mono** (mono, 400/500) — used for both inline code and code blocks, and for tiny mono captions. Note: max weight is 500 (no 600/700); heavier weights synthesise.

The Google Fonts URL is baked into `BaseLayout.astro` head.

### Other rules
- **No gradients.** Anywhere. Not in placeholders, not in buttons, not in backgrounds. The constraint forces hierarchy through typography and space.
- **Image placeholders**: `https://picsum.photos/seed/{name}/{w}/{h}` with stable seeds. NEVER `source.unsplash.com` (deprecated). NEVER gradient `<div>`s.
- **No arbitrary Tailwind sizes** like `text-[13px]`. Use the built-in scale (`text-xs/sm/base/lg/...`). Inline code is `0.8em`, baked into the theme.
- **Badges/tags/pills**: `warm-white` bg, `charcoal` text, **no border**. Pre-built `.badge` / `.badge-mono` utilities — use them, don't repeat the class string.
- **Page layout**: 260px fixed left sidebar at `top-12 bottom-0`, right border `warm-white`. Main is `<main class="ml-[260px] px-12 py-10">`. Post page adds `xl:mr-[300px]` for the right rail.
  - **Content pages (post/list/home) use a centered column**: `.prose-pressmark` caps at 46rem; the opt-in `.wide-media` variant (`.prose-pressmark.wide-media` in `pressmark.css`) centers a 54rem container via CSS grid and lets media — images, code blocks, tables — break out from the 46rem text measure to the full 54rem. List/home pages mirror the same centered column so content doesn't shift horizontally when navigating list ↔ post.
  - **Other surfaces stay left-anchored** — no `mx-auto` centered max-width outside the content column above. Don't centered-column-ify chrome (sidebar, nav, non-editorial utility pages) without a specific reason.

### CSS classes published as API
- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-link`
- `.badge` / `.badge-mono`
- `.card`, `.hairline`, `.nav-item`, `.panel-label`, `.section-label`
- `.checkbox`, `.progress` + `.progress-fill`
- `.prose-pressmark` + `.dropcap`

Renaming these is a breaking change — bump the major version.

## Anti-goals (deliberate omissions)

- **WCAG 2.1 AA contrast** is NOT a target. warm-gray on paper is 2.24:1, accent on paper is 3.37:1, warm-white borders are 1.10:1. We tested a high-contrast AA variant; user rejected it as aesthetically wrong for the brand. Consumers shipping on public sites are warned in the README.
- **Dark mode** is not implemented.
- **JS interactivity** — pressmark now ships minimal, progressive-enhancement JS where a feature genuinely needs it (first case: `TableOfContents` scroll-spy via `IntersectionObserver`). Rule: components MUST degrade gracefully without JS (e.g. ToC links still jump to anchors). Heavier interactivity (theme toggle, search modal) remains static/unbuilt.

## Architectural notes

- `BaseLayout` is intentionally bare: html shell, font links, and two named slots (`sidebar` + default). It does NOT bake in any chrome. Consumers wire their own sidebar via the named slot.
- `Sidebar` is generic — takes `items: SidebarItem[]`, `brand?`, and a default slot for extras (search, theme toggle, image, quote). `SidebarItem.icon` is raw SVG inner content.
- The demo wraps `BaseLayout` + a `DemoSidebar` (specific nav items + extras) in `apps/demo/src/layouts/SiteLayout.astro`. Demo pages use `SiteLayout`, not `BaseLayout` directly.
- `PostLayout` was removed in v0.1.x — the demo's `post.astro` has bespoke right-rail content (custom Quick action items, prev/next nav, footer with attribution) that didn't fit a generic prop API. Consumers writing their own post page can crib from `apps/demo/src/pages/post.astro` as the open-source reference. Re-introduce a refined `PostLayout` in v0.2 based on real consumer demand.

## Known follow-ups

- Trusted Publishing on npmjs.com is set up for both packages (validated by manual workflow_dispatch — OIDC auth passed, only blocked on "version already exists"). Future releases via `gh release create` will publish automatically without OTP.
- The `apps/demo/src/styles/main.css` `@source` to `../../../../packages/astro/src/**/*` is a workspace-relative path. Real consumers must add a separate `@source "../../node_modules/@pressmark/astro/src/**/*.astro"` — documented in the astro README.

## Tooling notes

- This is a **bun workspaces** monorepo. Don't suggest pnpm migration unless asked.
- The user has `ast-grep`, `difftastic`, `sd`, `comby`, `hyperfine`, `git-delta`, `scc`, `yq` globally — prefer these where they fit (e.g., `sd` for batch text replacements).
- See `~/Server/side/CLAUDE.md` for context-mode routing rules that apply to all projects in `Server/side/`.
