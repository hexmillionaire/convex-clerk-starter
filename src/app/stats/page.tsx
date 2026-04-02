"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { useUser } from "@clerk/nextjs";
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
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const stats = useQuery(api.stats.get, isAuthenticated ? {} : "skip");

  if (!clerkLoaded) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
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

  // Build full book progress for all 66 books
  const allBooks = BIBLE_BOOKS.map((b) => ({
    name: b.name,
    slug: b.slug,
    testament: b.testament,
    read: stats.bookProgress[b.slug] ?? 0,
    total: b.chapters,
    percent: b.chapters > 0 ? Math.round(((stats.bookProgress[b.slug] ?? 0) / b.chapters) * 100) : 0,
  }));

  const completedBooks = allBooks.filter((b) => b.read >= b.total);
  const inProgressBooks = allBooks.filter((b) => b.read > 0 && b.read < b.total);
  const unreadBooks = allBooks.filter((b) => b.read === 0);

  // Top most-read books (sorted by progress %)
  const topBooks = allBooks
    .filter((b) => b.read > 0)
    .sort((a, b) => b.percent - a.percent || b.read - a.read)
    .slice(0, 8);

  // OT/NT stats
  const otBooks = allBooks.filter((b) => b.testament === "OLD");
  const ntBooks = allBooks.filter((b) => b.testament === "NEW");
  const otChaptersRead = otBooks.reduce((sum, b) => sum + b.read, 0);
  const otChaptersTotal = otBooks.reduce((sum, b) => sum + b.total, 0);
  const ntChaptersRead = ntBooks.reduce((sum, b) => sum + b.read, 0);
  const ntChaptersTotal = ntBooks.reduce((sum, b) => sum + b.total, 0);
  const otPercent = otChaptersTotal > 0 ? Math.round((otChaptersRead / otChaptersTotal) * 100) : 0;
  const ntPercent = ntChaptersTotal > 0 ? Math.round((ntChaptersRead / ntChaptersTotal) * 100) : 0;

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
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{completedBooks.length} of {stats.totalBooks} books completed</span>
            <span>{stats.booksRead} books started</span>
          </div>
        </CardContent>
      </Card>

      {/* OT vs NT breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-heading font-semibold text-sm mb-3">Old Testament</h3>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{otBooks.filter(b => b.read > 0).length}/39 books</span>
              <span>{otChaptersRead}/{otChaptersTotal} chapters · {otPercent}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${otPercent}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="font-heading font-semibold text-sm mb-3">New Testament</h3>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{ntBooks.filter(b => b.read > 0).length}/27 books</span>
              <span>{ntChaptersRead}/{ntChaptersTotal} chapters · {ntPercent}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${ntPercent}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top books in progress */}
      {topBooks.length > 0 && (
        <div className="mb-10">
          <h2 className="font-heading font-semibold text-lg mb-4">
            Book Progress
          </h2>
          <div className="space-y-3">
            {topBooks.map((entry) => (
              <div key={entry.slug} className="flex items-center gap-3">
                <Link
                  href={`/bible/${entry.slug}`}
                  className="text-sm font-medium w-32 truncate hover:text-primary transition-colors"
                >
                  {entry.name}
                </Link>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${entry.percent >= 100 ? "bg-green-500" : "bg-primary/80"}`}
                    style={{ width: `${entry.percent}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono w-20 text-right">
                  {entry.read}/{entry.total} {entry.percent >= 100 && "✓"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Books */}
      {completedBooks.length > 0 && (
        <div className="mb-10">
          <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="text-green-600">✓</span> Completed Books ({completedBooks.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {completedBooks.map((b) => (
              <Link key={b.slug} href={`/bible/${b.slug}`}>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                  {b.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Books */}
      {inProgressBooks.length > 0 && (
        <div className="mb-10">
          <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> In Progress ({inProgressBooks.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {inProgressBooks.map((b) => (
              <Link key={b.slug} href={`/bible/${b.slug}`}>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                  {b.name} ({b.percent}%)
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Unread Books */}
      {unreadBooks.length > 0 && (
        <div className="mb-10">
          <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="text-muted-foreground">○</span> Not Yet Started ({unreadBooks.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {unreadBooks.map((b) => (
              <Link key={b.slug} href={`/bible/${b.slug}`}>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors">
                  {b.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Full Bible Coverage Grid */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-heading font-semibold text-sm mb-4">Bible Coverage Map</h2>
          <div className="grid grid-cols-6 sm:grid-cols-11 md:grid-cols-16 lg:grid-cols-22 gap-1">
            {allBooks.map((b) => {
              const bg = b.percent >= 100
                ? "bg-green-500"
                : b.percent > 0
                ? "bg-primary/60"
                : "bg-muted";
              return (
                <Link key={b.slug} href={`/bible/${b.slug}`} title={`${b.name}: ${b.read}/${b.total} (${b.percent}%)`}>
                  <div className={`h-4 w-full rounded-sm ${bg} transition-colors hover:ring-2 hover:ring-primary/50`} />
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-muted" /> Not started
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-primary/60" /> In progress
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-green-500" /> Completed
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
