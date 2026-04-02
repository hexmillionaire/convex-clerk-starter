"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, CheckCircle } from "lucide-react";

type Props = {
  bookSlug: string;
  totalChapters: number;
};

export function BookChaptersGrid({ bookSlug, totalChapters }: Props) {
  const { isSignedIn } = useUser();
  const isAuthenticated = !!isSignedIn;

  const bookmarks = useQuery(api.bookmarks.list, isAuthenticated ? {} : "skip");
  const progress = useQuery(
    api.readingProgress.getForBook,
    isAuthenticated ? { bookSlug } : "skip"
  );

  // Build set of chapters that have bookmarked verses
  const chaptersWithBookmarks = new Set(
    (bookmarks ?? [])
      .filter((b) => b.bookSlug === bookSlug)
      .map((b) => b.chapter)
  );

  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => {
        const hasBookmark = chaptersWithBookmarks.has(ch);
        const isRead = progress?.[ch] ?? false;

        return (
          <Link key={ch} href={`/bible/${bookSlug}/${ch}`}>
            <Card
              className={`transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer relative ${
                isRead ? "bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30" : ""
              }`}
            >
              <CardContent className="p-3 text-center">
                <span className="text-sm font-mono">{ch}</span>
                {hasBookmark && (
                  <Bookmark className="absolute top-0.5 right-0.5 h-3 w-3 text-primary fill-primary" />
                )}
                {isRead && (
                  <CheckCircle className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 text-green-600" />
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
