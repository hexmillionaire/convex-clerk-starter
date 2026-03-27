import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { VotdShareButton } from "./votd-share-button";

export const metadata: Metadata = {
  title: "Verse of the Day — Divine Word",
  description:
    "Today's Bible verse of the day. Daily scripture inspiration from the King James Version (KJV). Read, reflect, and share.",
  openGraph: {
    title: "Verse of the Day — Divine Word",
    description:
      "Daily Bible verse inspiration from the King James Version.",
    type: "article",
  },
  alternates: {
    canonical: "https://www.divineword.app/verse-of-the-day",
  },
};

const DAILY_VERSES = [
  { ref: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", book: "john", chapter: 3, verse: 16 },
  { ref: "Psalm 23:1", text: "The LORD is my shepherd; I shall not want.", book: "psalms", chapter: 23, verse: 1 },
  { ref: "Proverbs 3:5-6", text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.", book: "proverbs", chapter: 3, verse: 5 },
  { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me.", book: "philippians", chapter: 4, verse: 13 },
  { ref: "Romans 8:28", text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", book: "romans", chapter: 8, verse: 28 },
  { ref: "Isaiah 41:10", text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.", book: "isaiah", chapter: 41, verse: 10 },
  { ref: "Jeremiah 29:11", text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.", book: "jeremiah", chapter: 29, verse: 11 },
  { ref: "Matthew 11:28", text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", book: "matthew", chapter: 11, verse: 28 },
  { ref: "Psalm 46:10", text: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.", book: "psalms", chapter: 46, verse: 10 },
  { ref: "Joshua 1:9", text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.", book: "joshua", chapter: 1, verse: 9 },
  { ref: "Psalm 119:105", text: "Thy word is a lamp unto my feet, and a light unto my path.", book: "psalms", chapter: 119, verse: 105 },
  { ref: "Romans 12:2", text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.", book: "romans", chapter: 12, verse: 2 },
  { ref: "Hebrews 11:1", text: "Now faith is the substance of things hoped for, the evidence of things not seen.", book: "hebrews", chapter: 11, verse: 1 },
  { ref: "Ephesians 2:8-9", text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.", book: "ephesians", chapter: 2, verse: 8 },
  { ref: "Psalm 27:1", text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?", book: "psalms", chapter: 27, verse: 1 },
  { ref: "2 Timothy 1:7", text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.", book: "2-timothy", chapter: 1, verse: 7 },
  { ref: "Psalm 37:4", text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.", book: "psalms", chapter: 37, verse: 4 },
  { ref: "1 Corinthians 13:4-5", text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;", book: "1-corinthians", chapter: 13, verse: 4 },
  { ref: "Galatians 5:22-23", text: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.", book: "galatians", chapter: 5, verse: 22 },
  { ref: "Psalm 91:1-2", text: "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.", book: "psalms", chapter: 91, verse: 1 },
  { ref: "Matthew 6:33", text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.", book: "matthew", chapter: 6, verse: 33 },
  { ref: "Isaiah 40:31", text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", book: "isaiah", chapter: 40, verse: 31 },
  { ref: "Romans 15:13", text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.", book: "romans", chapter: 15, verse: 13 },
  { ref: "Psalm 34:8", text: "O taste and see that the LORD is good: blessed is the man that trusteth in him.", book: "psalms", chapter: 34, verse: 8 },
  { ref: "Colossians 3:23", text: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men;", book: "colossians", chapter: 3, verse: 23 },
  { ref: "Proverbs 18:10", text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.", book: "proverbs", chapter: 18, verse: 10 },
  { ref: "Psalm 139:14", text: "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.", book: "psalms", chapter: 139, verse: 14 },
  { ref: "James 1:5", text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.", book: "james", chapter: 1, verse: 5 },
  { ref: "1 Peter 5:7", text: "Casting all your care upon him; for he careth for you.", book: "1-peter", chapter: 5, verse: 7 },
  { ref: "Psalm 121:1-2", text: "I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth.", book: "psalms", chapter: 121, verse: 1 },
  { ref: "Matthew 5:16", text: "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.", book: "matthew", chapter: 5, verse: 16 },
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function VerseOfTheDayPage() {
  const dayOfYear = getDayOfYear();
  const todayVerse = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];

  // Show a few recent/upcoming verses
  const recentVerses = Array.from({ length: 6 }, (_, i) => {
    const offset = dayOfYear - i - 1;
    const idx = ((offset % DAILY_VERSES.length) + DAILY_VERSES.length) % DAILY_VERSES.length;
    return { ...DAILY_VERSES[idx], daysAgo: i + 1 };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Verse of the Day: ${todayVerse.ref}`,
    description: todayVerse.text,
    datePublished: new Date().toISOString().split("T")[0],
    publisher: {
      "@type": "Organization",
      name: "Divine Word",
      url: "https://www.divineword.app",
    },
    mainEntityOfPage: "https://www.divineword.app/verse-of-the-day",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container max-w-3xl mx-auto px-4 py-12">
        {/* Today's Verse */}
        <div className="text-center mb-8">
          <p className="text-primary text-lg mb-2">✦</p>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold mb-2">
            Verse of the Day
          </h1>
          <p className="text-sm text-muted-foreground italic">
            Daily scripture to inspire and encourage
          </p>
        </div>

        <Card className="mb-12 border-primary/20 shadow-md">
          <CardContent className="p-8 text-center">
            <p className="text-xl md:text-2xl leading-relaxed font-serif italic mb-6">
              &ldquo;{todayVerse.text}&rdquo;
            </p>
            <p className="text-primary font-heading font-semibold text-lg mb-6">
              — {todayVerse.ref} (KJV)
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href={`/bible/${todayVerse.book}/${todayVerse.chapter}/${todayVerse.verse}`}>
                <Button className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Read in Context
                </Button>
              </Link>
              <VotdShareButton reference={todayVerse.ref} text={todayVerse.text} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Verses */}
        <section>
          <h2 className="font-heading font-semibold text-lg mb-4">Recent Verses</h2>
          <div className="space-y-3">
            {recentVerses.map((v) => (
              <Link
                key={`${v.book}-${v.chapter}-${v.verse}`}
                href={`/bible/${v.book}/${v.chapter}/${v.verse}`}
              >
                <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-primary font-mono font-semibold">
                        {v.ref}
                      </p>
                      <span className="text-xs text-muted-foreground font-mono">
                        {v.daysAgo === 1 ? "Yesterday" : `${v.daysAgo} days ago`}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-2 italic">
                      &ldquo;{v.text}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/bible">
            <Button variant="outline" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Explore the Full Bible
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
