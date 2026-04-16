import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { VotdShareButton } from "./votd-share-button";
import { VerseImageShare } from "@/components/verse-image-share";
import { DAILY_VERSES, getVerseOfTheDay } from "@/lib/daily-verses";

export const revalidate = 86400;

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

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function VerseOfTheDayPage() {
  const dayOfYear = getDayOfYear();
  const todayVerse = getVerseOfTheDay();

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
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
              <VerseImageShare reference={todayVerse.ref} text={todayVerse.text} variant="button" />
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
