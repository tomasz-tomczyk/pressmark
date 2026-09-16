/**
 * Shared nav-link helpers for the Sidebar and Topbar shells.
 *
 * Both shells resolve hrefs against Astro's configured `base` and decide which
 * item is current. That logic lives here so the two can't drift apart.
 */

export type NavItem = {
  href: string;
  label: string;
  /** Raw SVG inner content (paths, rects, circles). Rendered inside a 16×16 viewBox="0 0 24 24" wrapper. */
  icon?: string;
};

/** Astro's base path, with any trailing slashes removed. */
const base = import.meta.env.BASE_URL.replace(/\/+$/, "");

/**
 * Prefix a site-root href with the configured base, so a library consumer
 * mounted at any base (e.g. GitHub Pages `/pressmark`) links correctly.
 * External and hash hrefs pass through untouched.
 */
export function withBase(href: string): string {
  if (!href) return href;
  if (href.startsWith("http") || href.startsWith("#")) return href;
  if (href === "/") return base + "/";
  if (href.startsWith("/")) return base + href;
  return href;
}

/** Strip base, hash, and surrounding slashes so two paths can be compared. */
export function normalizePath(path: string): string {
  if (!path) return "";
  const withoutBase = base ? path.replace(new RegExp("^" + base), "") : path;
  const noHash = withoutBase.split("#")[0] ?? "";
  return noHash.replace(/\/+$/, "").replace(/^\/+/, "");
}

/**
 * Is `href` the page currently being viewed?
 *
 * Section links match their descendants, so `/posts` stays current while the
 * reader is on `/posts/some-article`. The home link (`/`) is exempt, or it
 * would match every page on the site.
 */
export function isActive(href: string, currentPath: string): boolean {
  if (href.startsWith("#") || href.startsWith("http")) return false;

  const target = normalizePath(href);
  const here = normalizePath(currentPath);

  if (target === "") return here === "" || here === "index";
  return here === target || here.startsWith(target + "/");
}
