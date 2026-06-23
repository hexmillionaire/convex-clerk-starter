export type BookInfo = {
  name: string;
  slug: string;
  abbreviation: string;
  testament: "OLD" | "NEW";
  chapters: number;
  position: number;
};

export const BIBLE_BOOKS: BookInfo[] = [
  // Old Testament
  { name: "Genesis", slug: "genesis", abbreviation: "Gen", testament: "OLD", chapters: 50, position: 1 },
  { name: "Exodus", slug: "exodus", abbreviation: "Exo", testament: "OLD", chapters: 40, position: 2 },
  { name: "Leviticus", slug: "leviticus", abbreviation: "Lev", testament: "OLD", chapters: 27, position: 3 },
  { name: "Numbers", slug: "numbers", abbreviation: "Num", testament: "OLD", chapters: 36, position: 4 },
  { name: "Deuteronomy", slug: "deuteronomy", abbreviation: "Deu", testament: "OLD", chapters: 34, position: 5 },
  { name: "Joshua", slug: "joshua", abbreviation: "Jos", testament: "OLD", chapters: 24, position: 6 },
  { name: "Judges", slug: "judges", abbreviation: "Jdg", testament: "OLD", chapters: 21, position: 7 },
  { name: "Ruth", slug: "ruth", abbreviation: "Rth", testament: "OLD", chapters: 4, position: 8 },
  { name: "1 Samuel", slug: "1-samuel", abbreviation: "1Sa", testament: "OLD", chapters: 31, position: 9 },
  { name: "2 Samuel", slug: "2-samuel", abbreviation: "2Sa", testament: "OLD", chapters: 24, position: 10 },
  { name: "1 Kings", slug: "1-kings", abbreviation: "1Ki", testament: "OLD", chapters: 22, position: 11 },
  { name: "2 Kings", slug: "2-kings", abbreviation: "2Ki", testament: "OLD", chapters: 25, position: 12 },
  { name: "1 Chronicles", slug: "1-chronicles", abbreviation: "1Ch", testament: "OLD", chapters: 29, position: 13 },
  { name: "2 Chronicles", slug: "2-chronicles", abbreviation: "2Ch", testament: "OLD", chapters: 36, position: 14 },
  { name: "Ezra", slug: "ezra", abbreviation: "Ezr", testament: "OLD", chapters: 10, position: 15 },
  { name: "Nehemiah", slug: "nehemiah", abbreviation: "Neh", testament: "OLD", chapters: 13, position: 16 },
  { name: "Esther", slug: "esther", abbreviation: "Est", testament: "OLD", chapters: 10, position: 17 },
  { name: "Job", slug: "job", abbreviation: "Job", testament: "OLD", chapters: 42, position: 18 },
  { name: "Psalms", slug: "psalms", abbreviation: "Psa", testament: "OLD", chapters: 150, position: 19 },
  { name: "Proverbs", slug: "proverbs", abbreviation: "Pro", testament: "OLD", chapters: 31, position: 20 },
  { name: "Ecclesiastes", slug: "ecclesiastes", abbreviation: "Ecc", testament: "OLD", chapters: 12, position: 21 },
  { name: "Song of Solomon", slug: "song-of-solomon", abbreviation: "Sng", testament: "OLD", chapters: 8, position: 22 },
  { name: "Isaiah", slug: "isaiah", abbreviation: "Isa", testament: "OLD", chapters: 66, position: 23 },
  { name: "Jeremiah", slug: "jeremiah", abbreviation: "Jer", testament: "OLD", chapters: 52, position: 24 },
  { name: "Lamentations", slug: "lamentations", abbreviation: "Lam", testament: "OLD", chapters: 5, position: 25 },
  { name: "Ezekiel", slug: "ezekiel", abbreviation: "Ezk", testament: "OLD", chapters: 48, position: 26 },
  { name: "Daniel", slug: "daniel", abbreviation: "Dan", testament: "OLD", chapters: 12, position: 27 },
  { name: "Hosea", slug: "hosea", abbreviation: "Hos", testament: "OLD", chapters: 14, position: 28 },
  { name: "Joel", slug: "joel", abbreviation: "Jol", testament: "OLD", chapters: 3, position: 29 },
  { name: "Amos", slug: "amos", abbreviation: "Amo", testament: "OLD", chapters: 9, position: 30 },
  { name: "Obadiah", slug: "obadiah", abbreviation: "Oba", testament: "OLD", chapters: 1, position: 31 },
  { name: "Jonah", slug: "jonah", abbreviation: "Jon", testament: "OLD", chapters: 4, position: 32 },
  { name: "Micah", slug: "micah", abbreviation: "Mic", testament: "OLD", chapters: 7, position: 33 },
  { name: "Nahum", slug: "nahum", abbreviation: "Nah", testament: "OLD", chapters: 3, position: 34 },
  { name: "Habakkuk", slug: "habakkuk", abbreviation: "Hab", testament: "OLD", chapters: 3, position: 35 },
  { name: "Zephaniah", slug: "zephaniah", abbreviation: "Zep", testament: "OLD", chapters: 3, position: 36 },
  { name: "Haggai", slug: "haggai", abbreviation: "Hag", testament: "OLD", chapters: 2, position: 37 },
  { name: "Zechariah", slug: "zechariah", abbreviation: "Zec", testament: "OLD", chapters: 14, position: 38 },
  { name: "Malachi", slug: "malachi", abbreviation: "Mal", testament: "OLD", chapters: 4, position: 39 },
  // New Testament
  { name: "Matthew", slug: "matthew", abbreviation: "Mat", testament: "NEW", chapters: 28, position: 40 },
  { name: "Mark", slug: "mark", abbreviation: "Mrk", testament: "NEW", chapters: 16, position: 41 },
  { name: "Luke", slug: "luke", abbreviation: "Luk", testament: "NEW", chapters: 24, position: 42 },
  { name: "John", slug: "john", abbreviation: "Jhn", testament: "NEW", chapters: 21, position: 43 },
  { name: "Acts", slug: "acts", abbreviation: "Act", testament: "NEW", chapters: 28, position: 44 },
  { name: "Romans", slug: "romans", abbreviation: "Rom", testament: "NEW", chapters: 16, position: 45 },
  { name: "1 Corinthians", slug: "1-corinthians", abbreviation: "1Co", testament: "NEW", chapters: 16, position: 46 },
  { name: "2 Corinthians", slug: "2-corinthians", abbreviation: "2Co", testament: "NEW", chapters: 13, position: 47 },
  { name: "Galatians", slug: "galatians", abbreviation: "Gal", testament: "NEW", chapters: 6, position: 48 },
  { name: "Ephesians", slug: "ephesians", abbreviation: "Eph", testament: "NEW", chapters: 6, position: 49 },
  { name: "Philippians", slug: "philippians", abbreviation: "Php", testament: "NEW", chapters: 4, position: 50 },
  { name: "Colossians", slug: "colossians", abbreviation: "Col", testament: "NEW", chapters: 4, position: 51 },
  { name: "1 Thessalonians", slug: "1-thessalonians", abbreviation: "1Th", testament: "NEW", chapters: 5, position: 52 },
  { name: "2 Thessalonians", slug: "2-thessalonians", abbreviation: "2Th", testament: "NEW", chapters: 3, position: 53 },
  { name: "1 Timothy", slug: "1-timothy", abbreviation: "1Ti", testament: "NEW", chapters: 6, position: 54 },
  { name: "2 Timothy", slug: "2-timothy", abbreviation: "2Ti", testament: "NEW", chapters: 4, position: 55 },
  { name: "Titus", slug: "titus", abbreviation: "Tit", testament: "NEW", chapters: 3, position: 56 },
  { name: "Philemon", slug: "philemon", abbreviation: "Phm", testament: "NEW", chapters: 1, position: 57 },
  { name: "Hebrews", slug: "hebrews", abbreviation: "Heb", testament: "NEW", chapters: 13, position: 58 },
  { name: "James", slug: "james", abbreviation: "Jas", testament: "NEW", chapters: 5, position: 59 },
  { name: "1 Peter", slug: "1-peter", abbreviation: "1Pe", testament: "NEW", chapters: 5, position: 60 },
  { name: "2 Peter", slug: "2-peter", abbreviation: "2Pe", testament: "NEW", chapters: 3, position: 61 },
  { name: "1 John", slug: "1-john", abbreviation: "1Jn", testament: "NEW", chapters: 5, position: 62 },
  { name: "2 John", slug: "2-john", abbreviation: "2Jn", testament: "NEW", chapters: 1, position: 63 },
  { name: "3 John", slug: "3-john", abbreviation: "3Jn", testament: "NEW", chapters: 1, position: 64 },
  { name: "Jude", slug: "jude", abbreviation: "Jud", testament: "NEW", chapters: 1, position: 65 },
  { name: "Revelation", slug: "revelation", abbreviation: "Rev", testament: "NEW", chapters: 22, position: 66 },
];

export const OLD_TESTAMENT = BIBLE_BOOKS.filter((b) => b.testament === "OLD");
export const NEW_TESTAMENT = BIBLE_BOOKS.filter((b) => b.testament === "NEW");

export function getBookBySlug(slug: string): BookInfo | undefined {
  return BIBLE_BOOKS.find((b) => b.slug === slug);
}

export function getBookByName(name: string): BookInfo | undefined {
  return BIBLE_BOOKS.find(
    (b) => b.name.toLowerCase() === name.toLowerCase()
  );
}

/** Strip Strong's concordance tags <S>...</S> and clean up <sup> footnotes */
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
  // Drop translators' marginal notes / footnotes entirely (with their content),
  // so they don't pollute the verse text in the reader, bookmarks, and search.
  text = text.replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, "");
  // Remove any other HTML tags that may appear
  text = text.replace(/<\/?[^>]+(>|$)/g, "");
  // Strip bare Strong's numbers already baked into text (e.g. "God430" → "God")
  text = text.replace(/([a-zA-Z'])\d{1,5}\b/g, "$1");
  // Strip standalone Strong's numbers for Hebrew particles (e.g. " 853 ")
  text = text.replace(/\s\d{1,5}(?=\s|[.,;:!?]|$)/g, "");
  // Collapse multiple spaces left after stripping
  text = text.replace(/\s{2,}/g, " ");
  return text.trim();
}

export const HIGHLIGHT_COLORS = [
  { name: "Gold", value: "#e8c96a" },
  { name: "Rose", value: "#f4a0a0" },
  { name: "Sage", value: "#8aac84" },
  { name: "Sky", value: "#7eb8d8" },
  { name: "Lavender", value: "#b8a0d8" },
  { name: "Peach", value: "#f4c4a0" },
];
