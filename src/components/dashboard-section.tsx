"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import {
  Flame,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Bookmark,
} from "lucide-react";

export function DashboardSection() {
  const { isAuthenticated } = useConvexAuth();
  const stats = useQuery(api.stats.get, isAuthenticated ? {} : "skip");
  const bookmarks = useQuery(api.bookmarks.list, isAuthenticated ? {} : "skip");
  const allProgress = useQuery(
    api.readingProgress.getAllProgress,
    isAuthenticated ? {} : "skip"
  );

  if (!isAuthenticated || stats === undefined) return null;
  if (!stats) return null;

  const overallPercent = Math.round(
    (stats.chaptersRead / stats.totalBibleChapters) * 100
  );

  // Find the most recently read book/chapter to suggest "Continue Reading"
  const lastRead = allProgress
    ?.sort((a, b) => b._creationTime - a._creationTime)
    ?.[0];

  const lastBook = lastRead
    ? BIBLE_BOOKS.find((b) => b.slug === lastRead.bookSlug)
    : null;

  // Next chapter to read
  const continueHref = lastBook && lastRead
    ? lastRead.chapter < lastBook.chapters
      ? `/bible/${lastBook.slug}/${lastRead.chapter + 1}`
      : `/bible/${lastBook.slug}/${lastRead.chapter}`
    : null;

  const recentBookmarks = (bookmarks ?? []).slice(0, 3);

  return (
    <section className="py-8 md:py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-lg">Your Dashboard</h2>
          <Link href="/stats">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
              View All Stats <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
              <p className="text-2xl font-heading font-bold">{stats.streak}</p>
              <p className="text-[10px] text-muted-foreground font-mono">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-2xl font-heading font-bold">{stats.chaptersRead}</p>
              <p className="text-[10px] text-muted-foreground font-mono">Chapters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-heading font-bold">{overallPercent}%</p>
              <p className="text-[10px] text-muted-foreground font-mono">Complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Overall progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Bible Progress</span>
            <span className="font-mono">{stats.chaptersRead}/{stats.totalBibleChapters}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        {/* Continue reading + Recent bookmarks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {continueHref && lastBook && (
            <Link href={continueHref}>
              <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-primary/20">
                <CardContent className="p-5">
                  <p className="text-xs text-primary font-mono uppercase tracking-wider mb-2">
                    Continue Reading
                  </p>
                  <p className="font-heading font-semibold">
                    {lastBook.name} {lastRead!.chapter < lastBook.chapters ? lastRead!.chapter + 1 : lastRead!.chapter}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pick up where you left off
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}

          {recentBookmarks.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-primary font-mono uppercase tracking-wider">
                    Recent Bookmarks
                  </p>
                  <Link href="/bookmarks" className="text-xs text-muted-foreground hover:text-foreground">
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {recentBookmarks.map((bm) => (
                    <Link
                      key={bm._id}
                      href={`/bible/${bm.bookSlug}/${bm.chapter}/${bm.verseNumber}`}
                      className="block text-sm hover:text-primary transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Bookmark className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-mono text-xs text-primary">{bm.reference}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
