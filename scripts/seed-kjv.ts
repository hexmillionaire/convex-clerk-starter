/**
 * KJV Bible Seed Script
 *
 * Downloads the full KJV Bible JSON from a public source
 * and seeds it into the Supabase/Prisma database.
 *
 * Usage:
 *   npx tsx scripts/seed-kjv.ts
 *
 * Prerequisites:
 *   - DATABASE_URL set in .env
 *   - npx prisma db push (to create tables)
 */

import { PrismaClient, Testament } from "@prisma/client";

const prisma = new PrismaClient();

const BOOKS = [
  { name: "Genesis", slug: "genesis", abbr: "Gen", testament: "OLD" as const, chapters: 50, position: 1 },
  { name: "Exodus", slug: "exodus", abbr: "Exo", testament: "OLD" as const, chapters: 40, position: 2 },
  { name: "Leviticus", slug: "leviticus", abbr: "Lev", testament: "OLD" as const, chapters: 27, position: 3 },
  { name: "Numbers", slug: "numbers", abbr: "Num", testament: "OLD" as const, chapters: 36, position: 4 },
  { name: "Deuteronomy", slug: "deuteronomy", abbr: "Deu", testament: "OLD" as const, chapters: 34, position: 5 },
  { name: "Joshua", slug: "joshua", abbr: "Jos", testament: "OLD" as const, chapters: 24, position: 6 },
  { name: "Judges", slug: "judges", abbr: "Jdg", testament: "OLD" as const, chapters: 21, position: 7 },
  { name: "Ruth", slug: "ruth", abbr: "Rth", testament: "OLD" as const, chapters: 4, position: 8 },
  { name: "1 Samuel", slug: "1-samuel", abbr: "1Sa", testament: "OLD" as const, chapters: 31, position: 9 },
  { name: "2 Samuel", slug: "2-samuel", abbr: "2Sa", testament: "OLD" as const, chapters: 24, position: 10 },
  { name: "1 Kings", slug: "1-kings", abbr: "1Ki", testament: "OLD" as const, chapters: 22, position: 11 },
  { name: "2 Kings", slug: "2-kings", abbr: "2Ki", testament: "OLD" as const, chapters: 25, position: 12 },
  { name: "1 Chronicles", slug: "1-chronicles", abbr: "1Ch", testament: "OLD" as const, chapters: 29, position: 13 },
  { name: "2 Chronicles", slug: "2-chronicles", abbr: "2Ch", testament: "OLD" as const, chapters: 36, position: 14 },
  { name: "Ezra", slug: "ezra", abbr: "Ezr", testament: "OLD" as const, chapters: 10, position: 15 },
  { name: "Nehemiah", slug: "nehemiah", abbr: "Neh", testament: "OLD" as const, chapters: 13, position: 16 },
  { name: "Esther", slug: "esther", abbr: "Est", testament: "OLD" as const, chapters: 10, position: 17 },
  { name: "Job", slug: "job", abbr: "Job", testament: "OLD" as const, chapters: 42, position: 18 },
  { name: "Psalms", slug: "psalms", abbr: "Psa", testament: "OLD" as const, chapters: 150, position: 19 },
  { name: "Proverbs", slug: "proverbs", abbr: "Pro", testament: "OLD" as const, chapters: 31, position: 20 },
  { name: "Ecclesiastes", slug: "ecclesiastes", abbr: "Ecc", testament: "OLD" as const, chapters: 12, position: 21 },
  { name: "Song of Solomon", slug: "song-of-solomon", abbr: "Sng", testament: "OLD" as const, chapters: 8, position: 22 },
  { name: "Isaiah", slug: "isaiah", abbr: "Isa", testament: "OLD" as const, chapters: 66, position: 23 },
  { name: "Jeremiah", slug: "jeremiah", abbr: "Jer", testament: "OLD" as const, chapters: 52, position: 24 },
  { name: "Lamentations", slug: "lamentations", abbr: "Lam", testament: "OLD" as const, chapters: 5, position: 25 },
  { name: "Ezekiel", slug: "ezekiel", abbr: "Ezk", testament: "OLD" as const, chapters: 48, position: 26 },
  { name: "Daniel", slug: "daniel", abbr: "Dan", testament: "OLD" as const, chapters: 12, position: 27 },
  { name: "Hosea", slug: "hosea", abbr: "Hos", testament: "OLD" as const, chapters: 14, position: 28 },
  { name: "Joel", slug: "joel", abbr: "Jol", testament: "OLD" as const, chapters: 3, position: 29 },
  { name: "Amos", slug: "amos", abbr: "Amo", testament: "OLD" as const, chapters: 9, position: 30 },
  { name: "Obadiah", slug: "obadiah", abbr: "Oba", testament: "OLD" as const, chapters: 1, position: 31 },
  { name: "Jonah", slug: "jonah", abbr: "Jon", testament: "OLD" as const, chapters: 4, position: 32 },
  { name: "Micah", slug: "micah", abbr: "Mic", testament: "OLD" as const, chapters: 7, position: 33 },
  { name: "Nahum", slug: "nahum", abbr: "Nah", testament: "OLD" as const, chapters: 3, position: 34 },
  { name: "Habakkuk", slug: "habakkuk", abbr: "Hab", testament: "OLD" as const, chapters: 3, position: 35 },
  { name: "Zephaniah", slug: "zephaniah", abbr: "Zep", testament: "OLD" as const, chapters: 3, position: 36 },
  { name: "Haggai", slug: "haggai", abbr: "Hag", testament: "OLD" as const, chapters: 2, position: 37 },
  { name: "Zechariah", slug: "zechariah", abbr: "Zec", testament: "OLD" as const, chapters: 14, position: 38 },
  { name: "Malachi", slug: "malachi", abbr: "Mal", testament: "OLD" as const, chapters: 4, position: 39 },
  { name: "Matthew", slug: "matthew", abbr: "Mat", testament: "NEW" as const, chapters: 28, position: 40 },
  { name: "Mark", slug: "mark", abbr: "Mrk", testament: "NEW" as const, chapters: 16, position: 41 },
  { name: "Luke", slug: "luke", abbr: "Luk", testament: "NEW" as const, chapters: 24, position: 42 },
  { name: "John", slug: "john", abbr: "Jhn", testament: "NEW" as const, chapters: 21, position: 43 },
  { name: "Acts", slug: "acts", abbr: "Act", testament: "NEW" as const, chapters: 28, position: 44 },
  { name: "Romans", slug: "romans", abbr: "Rom", testament: "NEW" as const, chapters: 16, position: 45 },
  { name: "1 Corinthians", slug: "1-corinthians", abbr: "1Co", testament: "NEW" as const, chapters: 16, position: 46 },
  { name: "2 Corinthians", slug: "2-corinthians", abbr: "2Co", testament: "NEW" as const, chapters: 13, position: 47 },
  { name: "Galatians", slug: "galatians", abbr: "Gal", testament: "NEW" as const, chapters: 6, position: 48 },
  { name: "Ephesians", slug: "ephesians", abbr: "Eph", testament: "NEW" as const, chapters: 6, position: 49 },
  { name: "Philippians", slug: "philippians", abbr: "Php", testament: "NEW" as const, chapters: 4, position: 50 },
  { name: "Colossians", slug: "colossians", abbr: "Col", testament: "NEW" as const, chapters: 4, position: 51 },
  { name: "1 Thessalonians", slug: "1-thessalonians", abbr: "1Th", testament: "NEW" as const, chapters: 5, position: 52 },
  { name: "2 Thessalonians", slug: "2-thessalonians", abbr: "2Th", testament: "NEW" as const, chapters: 3, position: 53 },
  { name: "1 Timothy", slug: "1-timothy", abbr: "1Ti", testament: "NEW" as const, chapters: 6, position: 54 },
  { name: "2 Timothy", slug: "2-timothy", abbr: "2Ti", testament: "NEW" as const, chapters: 4, position: 55 },
  { name: "Titus", slug: "titus", abbr: "Tit", testament: "NEW" as const, chapters: 3, position: 56 },
  { name: "Philemon", slug: "philemon", abbr: "Phm", testament: "NEW" as const, chapters: 1, position: 57 },
  { name: "Hebrews", slug: "hebrews", abbr: "Heb", testament: "NEW" as const, chapters: 13, position: 58 },
  { name: "James", slug: "james", abbr: "Jas", testament: "NEW" as const, chapters: 5, position: 59 },
  { name: "1 Peter", slug: "1-peter", abbr: "1Pe", testament: "NEW" as const, chapters: 5, position: 60 },
  { name: "2 Peter", slug: "2-peter", abbr: "2Pe", testament: "NEW" as const, chapters: 3, position: 61 },
  { name: "1 John", slug: "1-john", abbr: "1Jn", testament: "NEW" as const, chapters: 5, position: 62 },
  { name: "2 John", slug: "2-john", abbr: "2Jn", testament: "NEW" as const, chapters: 1, position: 63 },
  { name: "3 John", slug: "3-john", abbr: "3Jn", testament: "NEW" as const, chapters: 1, position: 64 },
  { name: "Jude", slug: "jude", abbr: "Jud", testament: "NEW" as const, chapters: 1, position: 65 },
  { name: "Revelation", slug: "revelation", abbr: "Rev", testament: "NEW" as const, chapters: 22, position: 66 },
];

async function seed() {
  console.log("🌱 Starting KJV seed...\n");

  // 1. Create KJV translation
  const translation = await prisma.translation.upsert({
    where: { abbreviation: "KJV" },
    update: {},
    create: {
      abbreviation: "KJV",
      name: "King James Version",
      language: "en",
      isDefault: true,
    },
  });
  console.log(`✅ Translation: ${translation.name}`);

  // 2. Create books
  for (const b of BOOKS) {
    await prisma.book.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        name: b.name,
        slug: b.slug,
        abbreviation: b.abbr,
        testament: b.testament === "OLD" ? Testament.OLD : Testament.NEW,
        position: b.position,
        chapters: b.chapters,
      },
    });
  }
  console.log(`✅ Created ${BOOKS.length} books`);

  // 3. Fetch and seed verses using Bolls.life API
  const allBooks = await prisma.book.findMany({ orderBy: { position: "asc" } });

  for (const book of allBooks) {
    const bookData = BOOKS.find((b) => b.slug === book.slug);
    if (!bookData) continue;

    console.log(`📖 Seeding ${book.name}...`);

    for (let ch = 1; ch <= bookData.chapters; ch++) {
      try {
        const res = await fetch(
          `https://bolls.life/get-text/KJV/${bookData.position}/${ch}/`
        );
        if (!res.ok) {
          console.warn(`  ⚠️  Failed to fetch ${book.name} ${ch}`);
          continue;
        }

        const verses: { verse: number; text: string }[] = await res.json();

        for (const v of verses) {
          await prisma.verse.upsert({
            where: {
              bookId_chapter_verseNumber_translationId: {
                bookId: book.id,
                chapter: ch,
                verseNumber: v.verse,
                translationId: translation.id,
              },
            },
            update: { text: v.text.trim() },
            create: {
              bookId: book.id,
              chapter: ch,
              verseNumber: v.verse,
              text: v.text.trim(),
              translationId: translation.id,
            },
          });
        }
      } catch (err) {
        console.warn(`  ⚠️  Error seeding ${book.name} ${ch}:`, err);
      }

      // Small delay to be polite to the API
      await new Promise((r) => setTimeout(r, 100));
    }

    console.log(`  ✅ ${book.name} complete`);
  }

  console.log("\n🎉 KJV seed complete!");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
