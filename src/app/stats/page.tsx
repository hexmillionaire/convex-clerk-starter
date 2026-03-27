"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import {
  BookOpen,
  Flame,
  Bookmark,
  Highlighter,
  PenLine,
  TrendingUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StatsPage() {
  const { isAuthenticated } = useConvexAuth();
  const stats = useQuery(api.stats.get, isAuthenticated ? {} : "skip");

  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-primary text-lg mb-2">✦</p>
        <h1 className="text-2xl font-heading font-semibold mb-2">
          Reading Statistics
        </h1>
        <p className="text-muted-foreground mb-6">
          Sign in to track your reading progress and see your stats.
        </p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (stats === undefined) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Loading stats...</p>
      </div>
    );
  }

  if (!stats) return null;

  const overallPercent = Math.round(
    (stats.chaptersRead / stats.totalBibleChapters) * 100
  );

  // Find top 5 most-read books
  const bookEntries = Object.entries(stats.bookProgress)
    .map(([slug, count]) => ({
      name: BIBLE_BOOKS.find((b) => b.slug === slug)?.name ?? slug,
      slug,
      read: count,
      total: BIBLE_BOOKS.find((b) => b.slug === slug)?.chapters ?? 0,
    }))
    .sort((a, b) => b.read - a.read)
    .slice(0, 8);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <p className="text-primary text-lg mb-2">✦</p>
        <h1 className="text-2xl md:text-3xl font-heading font-semibold mb-2">
          Reading Statistics
        </h1>
        <p className="text-muted-foreground italic">
          Your journey through scripture
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <Card>
          <CardContent className="p-5 text-center">
            <Flame className="h-5 w-5 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-heading font-bold">{stats.streak}</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Day Streak
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <BookOpen className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-3xl font-heading font-bold">
              {stats.chaptersRead}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Chapters Read
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-heading font-bold">{overallPercent}%</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Bible Complete
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <Bookmark className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-heading font-bold">
              {stats.totalBookmarks}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Bookmarks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <Highlighter className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-heading font-bold">
              {stats.totalHighlights}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Highlights
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <PenLine className="h-5 w-5 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-heading font-bold">
              {stats.totalJournalEntries}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Journal Entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall progress bar */}
      <Card className="mb-10">
        <CardContent className="p-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Bible Progress</span>
            <span className="text-muted-foreground font-mono">
              {stats.chaptersRead} / {stats.totalBibleChapters} chapters
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.booksRead} of {stats.totalBooks} books started
          </p>
        </CardContent>
      </Card>

      {/* Per-book progress */}
      {bookEntries.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-lg mb-4">
            Book Progress
          </h2>
          <div className="space-y-3">
            {bookEntries.map((entry) => {
              const pct =
                entry.total > 0
                  ? Math.round((entry.read / entry.total) * 100)
                  : 0;
              return (
                <div key={entry.slug} className="flex items-center gap-3">
                  <Link
                    href={`/bible/${entry.slug}`}
                    className="text-sm font-medium w-32 truncate hover:text-primary transition-colors"
                  >
                    {entry.name}
                  </Link>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/80 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono w-16 text-right">
                    {entry.read}/{entry.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
