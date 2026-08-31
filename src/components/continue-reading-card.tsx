"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useUser } from "@/lib/auth";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import { ArrowRight, Clock } from "lucide-react";
import { VERSE_COUNTS } from "@/lib/verse-counts";

function estimateReadingTime(bookSlug: string, chapter: number): string {
  const chapters = VERSE_COUNTS[bookSlug];
  const verseCount = chapters?.[chapter - 1] ?? 25;
  // ~15 words per verse average, 200 words per minute reading speed
  const minutes = Math.max(1, Math.round((verseCount * 15) / 200));
  return `${minutes} min read`;
}

export function ContinueReadingCard() {
  const { isSignedIn } = useUser();
  const allProgress = useQuery(
    api.readingProgress.getAllProgress,
    isSignedIn ? {} : "skip"
  );

  if (!isSignedIn) return <NewUserStartCard />;
  if (allProgress === undefined) return <ContinueReadingSkeleton />;
  if (!allProgress || allProgress.length === 0) return <NewUserStartCard />;

  const lastRead = allProgress
    .toSorted((a, b) => b._creationTime - a._creationTime)[0];

  const lastBook = BIBLE_BOOKS.find((b) => b.slug === lastRead.bookSlug);
  if (!lastBook) return <NewUserStartCard />;

  const nextChapter = lastRead.chapter < lastBook.chapters
    ? lastRead.chapter + 1
    : lastRead.chapter;
  const href = `/bible/${lastBook.slug}/${nextChapter}`;
  const readTime = estimateReadingTime(lastBook.slug, nextChapter);

  return (
    <section className="pb-6">
      <div className="container max-w-2xl mx-auto px-6">
        <Link href={href} className="group block">
          <Card className="border-primary/10 rounded-2xl card-hover">
            <CardContent className="p-5 md:p-6 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1.5">
                  Continue Reading
                </p>
                <p className="font-heading font-semibold text-lg truncate">
                  {lastBook.name} {nextChapter}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{readTime}</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
}

function ContinueReadingSkeleton() {
  return (
    <section className="pb-6">
      <div className="container max-w-2xl mx-auto px-6">
        <Card className="border-primary/10 rounded-2xl">
          <CardContent className="p-5 md:p-6">
            <Skeleton className="h-3 w-28 mb-2.5" />
            <Skeleton className="h-5 w-36 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

const START_POINTS = [
  { name: "Gospel of John", slug: "john", chapter: 1, label: "The Story of Jesus" },
  { name: "Psalms", slug: "psalms", chapter: 1, label: "Comfort & Praise" },
  { name: "Genesis", slug: "genesis", chapter: 1, label: "The Beginning" },
  { name: "Proverbs", slug: "proverbs", chapter: 1, label: "Daily Wisdom" },
];

function NewUserStartCard() {
  return (
    <section className="pb-6">
      <div className="container max-w-2xl mx-auto px-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-4">
          Where to Start
        </p>
        <div className="grid grid-cols-2 gap-3">
          {START_POINTS.map((sp) => (
            <Link key={sp.slug} href={`/bible/${sp.slug}/${sp.chapter}`} className="group">
              <Card className="h-full rounded-xl card-hover">
                <CardContent className="p-4 md:p-5">
                  <p className="font-heading font-semibold text-[15px] mb-1">{sp.name}</p>
                  <p className="text-xs text-muted-foreground">{sp.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
