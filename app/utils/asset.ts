function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

/**
 * Prefix static asset paths with Vite's `base` (GitHub Pages project site).
 * - "/images/a.png" -> `${BASE_URL}images/a.png`
 * - "images/a.png"  -> `${BASE_URL}images/a.png`
 * - external URLs are returned as-is
 */
export function withBase(path: string) {
  if (!path) return path;

  // Keep external links untouched.
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path)) return path;

  const base = (import.meta.env.BASE_URL || "/").trim() || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;

  if (path.startsWith("/")) {
    return `${stripTrailingSlash(normalizedBase)}${path}`;
  }

  return `${normalizedBase}${path}`;
}

