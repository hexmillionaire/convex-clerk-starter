/**
 * Verse-text cleaner shared by the Convex action (`bible.fetchChapterFromAPI`)
 * and the seed action (`seed.seedBook`).
 *
 * This is a copy of `cleanVerseText` in `src/lib/bible-data.ts`. The two cannot
 * share a module because the `convex/` runtime and the Next `src/` bundle are
 * separate compilation units, so keep the logic here in sync with that source.
 */
export function cleanVerseText(raw: string): string {
  let text = raw;
  // Decode HTML entities first (API may return &lt; &gt; &amp; etc.)
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  // Remove Strong's concordance number tags: <S>1234</S>
  text = text.replace(/<S>\d+<\/S>/g, "");
  // Drop translators' marginal notes / footnotes entirely (with their content).
  text = text.replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, "");
  // Remove any other HTML tags that may appear
  text = text.replace(/<\/?[^>]+(>|$)/g, "");
  // Strip bare Strong's numbers baked into text (e.g. "God430" → "God")
  text = text.replace(/([a-zA-Z'])\d{1,5}\b/g, "$1");
  // Strip standalone Strong's numbers for Hebrew particles (e.g. " 853 ")
  text = text.replace(/\s\d{1,5}(?=\s|[.,;:!?]|$)/g, "");
  // Collapse multiple spaces left after stripping
  text = text.replace(/\s{2,}/g, " ");
  return text.trim();
}

/** Allowed translation codes (Bolls.life public-domain translations we support). */
export const TRANSLATIONS = ["KJV", "WEB", "ASV"] as const;
export type TranslationCode = (typeof TRANSLATIONS)[number];

/** Normalize an arbitrary string to a supported translation, defaulting to KJV. */
export function normalizeTranslation(value: string | null | undefined): TranslationCode {
  const upper = (value ?? "").toUpperCase();
  return (TRANSLATIONS as readonly string[]).includes(upper)
    ? (upper as TranslationCode)
    : "KJV";
}
