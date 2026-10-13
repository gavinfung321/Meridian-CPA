/** Prefix public asset paths with Vite `base` (e.g. `/Meridian-CPA/` on GitHub Pages). */
export function assetUrl(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${normalized}`;
}
