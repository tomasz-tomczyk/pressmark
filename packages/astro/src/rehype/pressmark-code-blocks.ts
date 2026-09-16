import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";
import type { Code, Root as MdastRoot } from "mdast";
import type { VFile } from "vfile";

const TITLES_KEY = "pressmarkCodeTitles";

function classNames(node: Element): string[] {
  const props = node.properties ?? {};
  const cn = props.className ?? props.class;
  if (Array.isArray(cn)) return cn.map(String);
  if (typeof cn === "string") return cn.split(/\s+/).filter(Boolean);
  return [];
}

function hasClass(node: Element, name: string): boolean {
  return classNames(node).includes(name);
}

function text(value: string): Element["children"][number] {
  return { type: "text", value };
}

function el(
  tagName: string,
  properties: Element["properties"],
  children: Element["children"] = [],
): Element {
  return { type: "element", tagName, properties, children };
}

const fileIcon: Element = el(
  "svg",
  {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    "aria-hidden": "true",
  },
  [
    el("path", { d: "M5 4h11l3 3v13H5z" }),
    el("path", { d: "M16 4v3h3" }),
  ],
);

function icon(props: Element["properties"], paths: Element[]): Element {
  return el(
    "svg",
    {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7",
      "aria-hidden": "true",
      ...props,
    },
    paths,
  );
}

/**
 * Copy button for a code-block header. Rendered `hidden` so no-JS pages show no
 * broken control; the BaseLayout script reveals and wires it up (progressive
 * enhancement, mirroring the TableOfContents pattern). Holds both a copy icon
 * and a hidden "copied" check icon that the script toggles for confirmation.
 */
function copyButton(): Element {
  const copyIcon = icon({ class: "code-block-copy-icon" }, [
    el("rect", { x: "9", y: "9", width: "11", height: "11", rx: "1.5" }),
    el("path", { d: "M5 15V5a1 1 0 0 1 1-1h10" }),
  ]);
  // No `hidden` attribute here: Tailwind preflight makes [hidden] !important,
  // which would beat the [data-copied] display swap. Hidden via CSS instead.
  const checkIcon = icon({ class: "code-block-copy-check" }, [
    el("path", { d: "M20 6 9 17l-5-5" }),
  ]);
  return el(
    "button",
    {
      type: "button",
      class: "code-block-copy",
      "data-pressmark-copy": "",
      "aria-label": "Copy code",
      hidden: true,
    },
    [copyIcon, checkIcon],
  );
}

/** Parse `title="..."` or `title='...'` from a fenced-code info string. */
export function parseCodeFenceTitle(meta?: string | null): string | undefined {
  if (!meta) return undefined;
  const match = meta.match(/\btitle=(?:"([^"]+)"|'([^']+)')/);
  return match?.[1] ?? match?.[2];
}

/**
 * Collects optional titles from fenced code blocks (in document order).
 * Pair with `rehypePressmarkCodeBlocks` via the shared vfile data key.
 */
export function remarkPressmarkCodeTitles() {
  return (tree: MdastRoot, file: VFile) => {
    const titles: Array<string | null> = [];
    visit(tree, "code", (node: Code) => {
      titles.push(parseCodeFenceTitle(node.meta) ?? null);
    });
    file.data[TITLES_KEY] = titles;
  };
}

/**
 * Shiki resolves a theme to literal hex values and writes them into inline
 * `style` attributes at build time. That makes highlighted code the one part of
 * a page that ignores the theme roles — re-point `--color-surface` for a dark
 * article and the prose follows while the code block stays light.
 *
 * Pressmark's Shiki theme is built from four roles and nothing else, so the
 * hexes map cleanly back to the custom properties they came from. Rewriting
 * them here means code follows whatever the roles are set to — including an
 * accent this theme has never seen.
 *
 * Consumers using their own Shiki theme pass their own map.
 */
export const PRESSMARK_SHIKI_TOKEN_MAP: Record<string, string> = {
  "#ECE9E2": "var(--color-raised)", // editor.background
  "#1F1F1F": "var(--color-ink)", // editor.foreground, variables
  "#ABA49A": "var(--color-muted)", // comments
  "#E05A24": "var(--color-accent)", // keywords, types
  "#007E46": "var(--color-code-string)", // strings, symbols, raw markup
  "#913F82": "var(--color-code-function)", // function names and calls
  "#0465AF": "var(--color-code-number)", // numerics, language constants
  "#007481": "var(--color-code-variable)", // function parameters
  // Punctuation and operators recede rather than taking a role of their own.
  "#6B6B6B": "color-mix(in oklab, var(--color-ink) 60%, var(--color-raised))",
};

/**
 * EVERY hex in `shiki.json` must appear above. Shiki bakes them into inline
 * styles at build time, so an unmapped colour is a literal that ignores the
 * theme — the block renders cream-on-cream inside a dark post, silently, with
 * no build error. Change one file and you change both.
 */

export type CodeBlockOptions = {
  /** Hex (any case) -> CSS value. Defaults to PRESSMARK_SHIKI_TOKEN_MAP. */
  tokenColorMap?: Record<string, string>;
};

/** Replace every mapped hex in an inline style string with its role variable. */
function mapStyleColors(style: string, map: Map<string, string>): string {
  return style.replace(/#[0-9a-fA-F]{3,8}\b/g, (hex) => {
    const full =
      hex.length === 4
        ? "#" +
          hex
            .slice(1)
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    return map.get(full.toUpperCase()) ?? hex;
  });
}

/**
 * Wraps Shiki `<pre class="astro-code">` output in the pressmark `.code-block` frame
 * so Markdown fences match the demo's CodeBlock styling (header + lang label).
 */
export function rehypePressmarkCodeBlocks(options: CodeBlockOptions = {}) {
  let titleIndex = 0;
  const colorMap = new Map(
    Object.entries(options.tokenColorMap ?? PRESSMARK_SHIKI_TOKEN_MAP).map(
      ([hex, value]) => [hex.toUpperCase(), value],
    ),
  );

  return (tree: Root, file: VFile) => {
    const titles = (file.data[TITLES_KEY] as Array<string | null> | undefined) ?? [];
    titleIndex = 0;

    visit(tree, "element", (node, index, parent) => {
      if (!parent || index == null) return;
      if (node.tagName !== "pre" || !hasClass(node, "astro-code")) return;
      if (parent.tagName === "figure" && hasClass(parent as Element, "code-block")) return;

      const lang =
        (node.properties?.dataLanguage as string | undefined) ??
        (node.properties?.["data-language"] as string | undefined) ??
        "";
      const title = titles[titleIndex] ?? undefined;
      titleIndex += 1;

      const existing = classNames(node);
      node.properties = {
        ...node.properties,
        class: [...existing, "code-block-body"].join(" "),
      };
      delete node.properties?.className;

      const titleChildren: Element["children"] = title
        ? [fileIcon, text(title)]
        : [];
      const actionChildren: Element["children"] = [];
      if (lang) {
        actionChildren.push(el("span", { class: "code-block-lang" }, [text(lang)]));
      }
      actionChildren.push(copyButton());
      const headerChildren: Element["children"] = [
        el("div", { class: "code-block-title" }, titleChildren),
        el("div", { class: "code-block-actions" }, actionChildren),
      ];

      const figure = el("figure", { class: "code-block" }, [
        el("figcaption", { class: "code-block-header" }, headerChildren),
        node,
      ]);

      parent.children[index] = figure;
    });

    // Re-point Shiki's baked hexes at the theme roles, so highlighted code
    // themes with the rest of the page rather than staying on the values the
    // theme was compiled with.
    if (colorMap.size) {
      visit(tree, "element", (node) => {
        const style = node.properties?.style;
        if (typeof style !== "string" || !style.includes("#")) return;
        node.properties = { ...node.properties, style: mapStyleColors(style, colorMap) };
      });
    }

    // Shiki leaves `\n` text nodes between `.line` spans — they double line height
    visit(tree, "element", (node) => {
      if (node.tagName !== "code") return;
      node.children = node.children.filter((child) => {
        if (child.type !== "text") return true;
        return child.value.trim().length > 0;
      });
    });
  };
}
