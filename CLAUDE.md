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

**These are rules about what Pressmark SHIPS, not about what a consumer CAN DO.**
Since 0.4.0 the tokens name roles, so a consumer can re-point any of them.
That is their business. Pressmark itself stays exactly one look.

### Palette — exactly six colors, no others (plus four for code)

Tokens name the ROLE, not the appearance — `--color-surface`, not `--color-paper`.
Renamed in 0.4.0 (breaking, no aliases).

| Token | Hex | Role | Was (≤0.3) |
|---|---|---|---|
| `surface` | `#F6F4EE` | page background | `paper` |
| `raised` | `#ECE9E2` | cards, badges, code bg, soft borders | `warm-white` |
| `line` | `#D9D6CC` | dividers, hairlines | `stone` |
| `muted` | `#ABA49A` | TINY MONO CAPTIONS ONLY | `warm-gray` |
| `ink` | `#1F1F1F` | primary text, dark surfaces | `charcoal` |
| `accent` | `#E05A24` | the one accent | `accent` |

- Never introduce a 7th hex **for UI**. Compose from the six.
- For a "muted text" effect, don't add a new gray — use font-size/weight to drop hierarchy.
- For a "soft accent" background, use `bg-accent/15` or `/25`, not a new color.

#### The syntax exception (added 0.5.0)

Four further roles exist, and they are permitted **inside code blocks only**:

| Token | Hex | Role | On `raised` |
|---|---|---|---|
| `code-string` | `#007E46` | strings, symbols, raw markup | 4.25:1 |
| `code-function` | `#913F82` | function names and calls | 5.35:1 |
| `code-number` | `#0465AF` | numerics, language constants | 4.97:1 |
| `code-variable` | `#007481` | function parameters (`meta.function`) | 4.54:1 |

Why it was granted: the six-colour rule left strings, functions, variables,
numbers and punctuation all sharing `ink` — 618 tokens across a real post
rendered in three colours, two-thirds of them identical. That is not a
restrained palette, it is an absent one. Highlighting that cannot distinguish a
string from a function is not doing its job.

The exception is narrow, in the same way the gradient exception is:

- **Syntax tokens only.** Never for text, UI, borders, icons or backgrounds.
  Reach for the six.
- **They are judged on `raised`, not `surface`** — a code block's background.
  A colour can pass against the page and vanish inside a snippet.
- Keywords and types keep `accent`; comments keep `muted`; punctuation is
  derived (`color-mix` of ink into raised) rather than taking a fourth token.
- Four is the ceiling. A fifth needs the same argument made again — and check
  the grammar can reach it first. Elixir gives plain locals (`res`, `depth`) no
  scope at all: they are bare `source.elixir`, so no theme can colour them, ours
  or github-light's. Parameters are reachable only via `meta.function`, which is
  what `code-variable` targets. Before concluding the highlighter is weak, dump
  the scopes: `hl.codeToTokens(src, { lang, theme, includeExplanation: true })`
  and print the leaf scope per token.
- **Hues are spread deliberately**: accent 40, string 155, variable 205,
  number 250, function 335 — smallest gap 45 deg, chroma 0.11-0.14 against the
  accent's 0.179. Tune in OKLCH. Two colours can differ in hex and be
  indistinguishable on screen; the first attempt at these shipped at chroma
  0.06-0.10 with all three at the same lightness and read as monochrome.
- **A consumer must separate these from its own accent.** The guard checks
  contrast, never hue collision — a blue accent plus a blue `code-number` is
  two colours that read as one, and it will build clean.

- **Syntax highlighting follows the roles too.** Shiki bakes theme hexes into
  inline styles at build time, which would make code the one element that
  ignores a re-pointed role. `rehypePressmarkCodeBlocks` maps them back via
  `PRESSMARK_SHIKI_TOKEN_MAP` (bg→raised, fg→ink, comments→muted,
  keywords/types→accent, and the four `code-*` roles). **Every hex in
  `shiki.json` must have an entry in that map** — an unmapped colour is a
  literal that ignores the theme, with no build error to tell you. Editing one
  file means editing the other. Consumers with their own Shiki theme pass
  `{ tokenColorMap }`.
- **Never hardcode a hex in a component.** Always `var(--color-*)` or the
  Tailwind class. This is what makes the roles re-pointable; breaking it
  silently un-themes that element for every consumer.

`AuthorCard`'s inline byline is **one colour, one face**: the eyebrow
("Written by") sits at the same ink as the name, because two tones inside a
single line pull the eye mid-sentence. Its social links sit at the `.meta`
grey rather than full ink — a row of brand glyphs at full strength competes
with the name above it.

Also renamed: `--shadow-paper` → `--shadow-soft` (it's a shadow, not a colour).

### Text rules
- **All text is `ink`** except links/CTAs in `accent`.
- `muted` is **reserved for the smallest mono captions** (`panel-label`, dataset codes). Don't use it for body copy or muted text — that's a Skill DON'T trap.

### Fonts — two faces, three tokens
- **Crimson Pro** (variable, 300–700) fills BOTH `--font-display` (headings) and
  `--font-body` (prose, UI, buttons). They are separate tokens so a consumer can
  set a different heading face without touching prose; by default they are the
  same face and the UI is entirely serif. There is no `--font-sans`.
  Type scale: display (h1) **48px**; `.dek` standfirst **26px**; prose/article
  body **21px**; all UI text **18px** (base body, nav, buttons, ToC, metadata).
  A subtitle under a title uses `.dek`, NOT `text-lg` — the UI size is below
  the reading size and inverts the hierarchy. Serif reads optically smaller than a
  sans. Reading column is 46rem; `.wide-media` breaks media out to 54rem.
- **IBM Plex Mono** (mono, 400/500) — used for both inline code and code blocks, and for tiny mono captions. Its slab terminals sit with Crimson Pro in a way a geometric mono does not; its x-height is much taller, which is why inline code is set well below the surrounding prose.

Prose `h2`/`h3` state `--font-display` explicitly rather than inheriting, so a
consumer's heading face still applies inside articles.

The Google Fonts URL is baked into `BaseLayout.astro` head.

### Other rules
- **No gradients**, with exactly one exception. Not in placeholders, not in
  buttons, not in backgrounds, not to manufacture hierarchy — that stays
  typography and space.
  - **The exception:** a legibility scrim behind text overlaid on media, i.e.
    `Hero` with `variant="banner"` and `scrimStyle="gradient"`. It earns it by
    doing something typography cannot: making text readable over arbitrary
    photographic content without flattening the whole picture. A flat wash
    (`scrimStyle="flat"`) dims the parts of the image carrying no text just as
    hard as the parts that do.
  - The exception is for THAT component and that purpose. A gradient anywhere
    else is still a bug. `flat` remains the default, so nothing picks this up
    by accident.
  - Encode the falloff in the gradient stops. Putting a fixed gradient under a
    second `opacity` scales the layer uniformly and turns it back into a flat
    wash — that bug shipped once already.
- **Image placeholders**: `https://picsum.photos/seed/{name}/{w}/{h}` with stable seeds. NEVER `source.unsplash.com` (deprecated). NEVER gradient `<div>`s.
- **No arbitrary Tailwind sizes** like `text-[13px]`. Use the built-in scale (`text-xs/sm/base/lg/...`). Inline code is `0.74em`, baked into the theme (matched to Crimson Pro’s x-height, not to the mono’s point size).
- **Badges/tags/pills**: `raised` bg, `ink` text, **no border**. Pre-built `.badge` / `.badge-mono` utilities — use them, don't repeat the class string.
- **Two shells, pick one per site**:
  - `Sidebar` — 260px fixed left rail at `top-12 bottom-0`, right border `raised`. Main is `<main class="ml-[260px] px-12 py-10">`. Post page adds `xl:mr-[300px]` for the right rail. Suits many destinations.
  - `Topbar` — fixed 14-unit horizontal bar. Main needs `pt-14`. Suits few destinations.
  - Both resolve hrefs and current-page state through `src/lib/nav.ts`. Put any
    nav logic there, never in one shell only.
  - **Content pages (post/list/home) use a centered column**: `.prose-pressmark` caps at 46rem; the opt-in `.wide-media` variant (`.prose-pressmark.wide-media` in `pressmark.css`) centers a 54rem container via CSS grid and lets media — images, code blocks, tables — break out from the 46rem text measure to the full 54rem. List/home pages mirror the same centered column so content doesn't shift horizontally when navigating list ↔ post.
  - **Other surfaces stay left-anchored** — no `mx-auto` centered max-width outside the content column above. Don't centered-column-ify chrome (sidebar, nav, non-editorial utility pages) without a specific reason.

### CSS classes published as API
- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-link`
- `.badge` / `.badge-mono`
- `.card`, `.hairline`, `.nav-item`, `.panel-label`, `.section-label`, `.dek`
- `.checkbox`, `.progress` + `.progress-fill`
- `.prose-pressmark` + `.dropcap`
- `AuthorCard` parts: `.author-card`, `.author-avatar`, `.author-name`,
  `.author-bio`, `.author-links`, `.author-link`, and — only with `href` —
  `.author-card-linked` + `.author-name-link`. These exist so a consumer
  restyling the card targets a name instead of `p:first-of-type`; a structural
  selector into component markup breaks silently the first time that markup
  gains an element.

Renaming these is a breaking change — bump the major version.

## Anti-goals (deliberate omissions)

- **WCAG 2.1 AA contrast** is NOT a target. muted on surface is 2.24:1, accent on surface is 3.37:1, raised borders are 1.10:1. We tested a high-contrast AA variant; user rejected it as aesthetically wrong for the brand. Consumers shipping on public sites are warned in the README.
- **Dark mode** is not implemented, and is not going to be. 0.4.0 made the
  tokens re-pointable, which is NOT the same thing: Pressmark ships one
  palette, light. A consumer wanting dark defines their own values for the
  six roles in their own project. Do not add a dark palette, a `scheme`
  switch, or a `prefers-color-scheme` block to this repo.
- **JS interactivity** — pressmark now ships minimal, progressive-enhancement JS where a feature genuinely needs it (first case: `TableOfContents` scroll-spy via `IntersectionObserver`). Rule: components MUST degrade gracefully without JS (e.g. ToC links still jump to anchors). Heavier interactivity (theme toggle, search modal) remains static/unbuilt.

## Architectural notes

- `BaseLayout` is intentionally bare: html shell, font links, and two named slots (`sidebar` + default). It does NOT bake in any chrome. Consumers wire their own sidebar via the named slot.
- `Sidebar` is generic — takes `items: SidebarItem[]`, `brand?`, and a default slot for extras (search, theme toggle, image, quote). `SidebarItem.icon` is raw SVG inner content.
- `Topbar` (0.4.0) is the horizontal counterpart, same item shape. Both delegate
  href-resolution and current-page matching to `src/lib/nav.ts`, so they can't
  drift. `isActive` matches section descendants (`/posts` stays current on
  `/posts/foo`), with `/` exempt so home doesn't match everything.
- `Hero` and `AuthorCard` (0.4.0) are content components, not chrome. `Hero`
  owns the frame/bleed/caption and takes a URL or astro:assets `ImageMetadata`;
  it never has opinions about the artwork.
- The demo wraps `BaseLayout` + a `DemoSidebar` (specific nav items + extras) in `apps/demo/src/layouts/SiteLayout.astro`. Demo pages use `SiteLayout`, not `BaseLayout` directly.
- `PostLayout` was removed in v0.1.x — the demo's `post.astro` has bespoke right-rail content (custom Quick action items, prev/next nav, footer with attribution) that didn't fit a generic prop API. Consumers writing their own post page can crib from `apps/demo/src/pages/post.astro` as the open-source reference. Re-introduce a refined `PostLayout` in v0.2 based on real consumer demand.

## Known follow-ups

- Trusted Publishing on npmjs.com is set up for both packages (validated by manual workflow_dispatch — OIDC auth passed, only blocked on "version already exists"). Future releases via `gh release create` will publish automatically without OTP.
- The `apps/demo/src/styles/main.css` `@source` to `../../../../packages/astro/src/**/*` is a workspace-relative path. Real consumers must add a separate `@source "../../node_modules/@pressmark/astro/src/**/*.astro"` — documented in the astro README.

## Comments

A comment earns its place only if it is still useful a year from now, to
someone who never saw the conversation that produced it. Write what is true of
the code as it stands.

- Explain the constraint, the gotcha, or the non-obvious mechanism — the thing
  the code cannot say about itself.
- No history: no "this replaces", "we used to", "before this prop existed",
  "what changed in 0.4.0", no narration of a rejected alternative or of the
  review that led here. That belongs in the commit message.
- No design-review prose. One sentence on why a value is load-bearing beats a
  paragraph defending it.
- Don't restate the code, and don't leave TODOs addressed to a person about
  work from a past session.

When editing a file, fix the comments around your change to match this. When a
comment above the code you touched narrates a past decision, delete it rather
than adding a second one below it.

## Tooling notes

- This is a **bun workspaces** monorepo. Don't suggest pnpm migration unless asked.
- The user has `ast-grep`, `difftastic`, `sd`, `comby`, `hyperfine`, `git-delta`, `scc`, `yq` globally — prefer these where they fit (e.g., `sd` for batch text replacements).
- See `~/Server/side/CLAUDE.md` for context-mode routing rules that apply to all projects in `Server/side/`.
