import { BIBLE_BOOKS } from "./bible-data";

export type DayReading = {
  label: string; // e.g. "Psalms 1-5"
  chapters: { bookSlug: string; chapter: number }[];
};

/** Build a flat list of { bookSlug, chapter } for a range of books */
function chaptersForBooks(startPos: number, endPos: number) {
  const chapters: { bookSlug: string; chapter: number }[] = [];
  for (let pos = startPos; pos <= endPos; pos++) {
    const book = BIBLE_BOOKS.find((b) => b.position === pos);
    if (!book) continue;
    for (let ch = 1; ch <= book.chapters; ch++) {
      chapters.push({ bookSlug: book.slug, chapter: ch });
    }
  }
  return chapters;
}

function bookName(slug: string) {
  return BIBLE_BOOKS.find((b) => b.slug === slug)?.name ?? slug;
}

/** Distribute chapters evenly across N days */
function distribute(
  allChapters: { bookSlug: string; chapter: number }[],
  days: number
): DayReading[] {
  const result: DayReading[] = [];
  const perDay = Math.ceil(allChapters.length / days);

  for (let d = 0; d < days; d++) {
    const start = d * perDay;
    const end = Math.min(start + perDay, allChapters.length);
    if (start >= allChapters.length) break;

    const dayChapters = allChapters.slice(start, end);
    const label = formatLabel(dayChapters);
    result.push({ label, chapters: dayChapters });
  }

  return result;
}

function formatLabel(chapters: { bookSlug: string; chapter: number }[]) {
  if (chapters.length === 0) return "";
  if (chapters.length === 1) {
    return `${bookName(chapters[0].bookSlug)} ${chapters[0].chapter}`;
  }

  // Group contiguous chapters by book
  const groups: { bookSlug: string; start: number; end: number }[] = [];
  let cur = { bookSlug: chapters[0].bookSlug, start: chapters[0].chapter, end: chapters[0].chapter };

  for (let i = 1; i < chapters.length; i++) {
    const ch = chapters[i];
    if (ch.bookSlug === cur.bookSlug && ch.chapter === cur.end + 1) {
      cur.end = ch.chapter;
    } else {
      groups.push({ ...cur });
      cur = { bookSlug: ch.bookSlug, start: ch.chapter, end: ch.chapter };
    }
  }
  groups.push(cur);

  return groups
    .map((g) => {
      const name = bookName(g.bookSlug);
      return g.start === g.end ? `${name} ${g.start}` : `${name} ${g.start}-${g.end}`;
    })
    .join("; ");
}

const scheduleCache = new Map<string, DayReading[]>();

export function getPlanSchedule(planSlug: string): DayReading[] {
  if (scheduleCache.has(planSlug)) return scheduleCache.get(planSlug)!;

  let schedule: DayReading[];

  switch (planSlug) {
    case "30-day-psalms": {
      // Psalms has 150 chapters, 5 per day for 30 days
      const chapters = chaptersForBooks(19, 19); // Psalms = position 19
      schedule = distribute(chapters, 30);
      break;
    }
    case "gospels-30": {
      // Matthew (28) + Mark (16) + Luke (24) + John (21) = 89 chapters in 30 days
      const chapters = chaptersForBooks(40, 43); // Matt-John = positions 40-43
      schedule = distribute(chapters, 30);
      break;
    }
    case "proverbs-31": {
      // 31 chapters, 1 per day
      const chapters = chaptersForBooks(20, 20); // Proverbs = position 20
      schedule = distribute(chapters, 31);
      break;
    }
    case "nt-90": {
      // Entire NT: Matthew through Revelation = positions 40-66
      const chapters = chaptersForBooks(40, 66);
      schedule = distribute(chapters, 90);
      break;
    }
    case "bible-365": {
      // Entire Bible: Genesis through Revelation = positions 1-66
      const chapters = chaptersForBooks(1, 66);
      schedule = distribute(chapters, 365);
      break;
    }
    case "romans-deep": {
      // Romans has 16 chapters, 1 per day
      const chapters = chaptersForBooks(45, 45); // Romans = position 45
      schedule = distribute(chapters, 16);
      break;
    }
    default:
      schedule = [];
  }

  scheduleCache.set(planSlug, schedule);
  return schedule;
}

export function getTodayReading(planSlug: string, currentDay: number): DayReading | null {
  const schedule = getPlanSchedule(planSlug);
  const idx = currentDay - 1; // currentDay is 1-based
  return idx >= 0 && idx < schedule.length ? schedule[idx] : null;
}
