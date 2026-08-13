/**
 * Sanitizes a product name into a URL-safe slug.
 * Removes curly/smart quotes, apostrophes, emojis, and ALL non-alphanumeric
 * characters that break Next.js URL routing.
 *
 * Common sources of broken slugs:
 *  - iPhone/macOS autocorrect turning " into " and "
 *  - Copy-pasting from Google Docs, Word, or WhatsApp
 */
export function sanitizeSlug(name: string): string {
  return (
    name
      .normalize("NFD") // Decompose accented chars (é → e + ́)
      .replace(/[\u0300-\u036f]/g, "") // Strip diacritical marks
      .replace(/[\u2018\u2019\u201a\u201b]/g, "") // Strip curly single quotes
      .replace(/[\u201c\u201d\u201e\u201f]/g, "") // Strip curly double quotes
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove ALL remaining special chars
      .trim() // Remove leading/trailing whitespace
      .replace(/\s+/g, "-") // Spaces → hyphens
      .replace(/-+/g, "-") // Collapse consecutive hyphens
      .replace(/^-|-$/g, "") // Trim leading/trailing hyphens
      + "-" + Date.now()
  );
}
