const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** The custom domain used for all short links (e.g. https://sch.sh). */
const SHORT_LINK_DOMAIN = "https://ourl.lat";

/** Generate a URL-safe random slug of the given length. */
export function generateSlug(length = 7): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let slug = "";
  for (let i = 0; i < length; i += 1) {
    slug += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return slug;
}

/** Whether the input looks like a valid http(s) URL. */
export function isValidUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Ensure the URL has a scheme; default to https when missing. */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/** Build the absolute short URL for a slug, on the custom short domain. */
export function buildShortUrl(slug: string): string {
  return `${SHORT_LINK_DOMAIN}/${slug}`;
}

/** Whether a user-supplied short code is valid (lowercase letters, numbers, hyphens). */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]{1,50}$/.test(slug);
}

/** Human-friendly relative time from an ISO timestamp. */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(mo / 12);
  return `${yr}y ago`;
}
