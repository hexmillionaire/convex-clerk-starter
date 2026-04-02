"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { BookOpen, Bookmark, Calendar, TrendingUp, TrendingDown } from "lucide-react";

/**
 * Weekly recap card showing this week's reading stats.
 * Only renders for signed-in users with activity this week.
 */
export function WeeklyRecap() {
  const { isSignedIn } = useUser();
  const recap = useQuery(api.stats.weeklyRecap, isSignedIn ? {} : "skip");

  if (!isSignedIn || !recap) return null;

  const trend = recap.chaptersRead - recap.lastWeekChapters;
  const trendUp = trend > 0;
  const trendNeutral = trend === 0;

  return (
    <section className="py-3">
      <div className="container max-w-2xl mx-auto px-6">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
              This Week
            </p>
            {!trendNeutral && (
              <div className="flex items-center gap-1 text-xs">
                {trendUp ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-orange-500" />
                )}
                <span
                  className={
                    trendUp
                      ? "text-green-600 font-mono"
                      : "text-orange-500 font-mono"
                  }
                >
                  {trendUp ? "+" : ""}
                  {trend} vs last week
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <BookOpen className="h-3.5 w-3.5 text-primary/60" />
              </div>
              <p className="text-xl font-heading font-bold tabular-nums">
                {recap.chaptersRead}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-0.5">
                Chapters
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Calendar className="h-3.5 w-3.5 text-primary/60" />
              </div>
              <p className="text-xl font-heading font-bold tabular-nums">
                {recap.daysActive}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-0.5">
                Days Active
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Bookmark className="h-3.5 w-3.5 text-primary/60" />
              </div>
              <p className="text-xl font-heading font-bold tabular-nums">
                {recap.versesBookmarked}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-0.5">
                Bookmarked
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
