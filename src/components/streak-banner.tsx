"use client";

import Link from "next/link";
import { Flame, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  streak: number;
  streakAtRisk: boolean;
  todayChapters: number;
  daysSinceLastRead: number;
};

/**
 * Duolingo-style streak banner. Shows:
 * - "Keep your X-day streak!" when streak is at risk (nothing read today)
 * - Celebratory state when user has read today
 * - Streak recovery prompt when streak was recently broken
 * - Hidden when no streak and no recent activity
 */
export function StreakBanner({ streak, streakAtRisk, todayChapters, daysSinceLastRead }: Props) {
  // Streak recovery — recently lost streak
  if (streak === 0 && todayChapters === 0 && daysSinceLastRead >= 1 && daysSinceLastRead <= 7) {
    return (
      <section className="pb-4">
        <div className="container max-w-2xl mx-auto px-6">
          <Link href="/bible" className="block">
            <div className="flex items-center gap-4 rounded-2xl border border-blue-300/30 bg-blue-50/60 dark:bg-blue-950/15 dark:border-blue-500/15 px-5 py-4 card-hover">
              <div className="relative shrink-0">
                <RotateCcw className="h-6 w-6 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-heading font-semibold text-blue-900 dark:text-blue-200">
                  Start a new streak today!
                </p>
                <p className="text-xs text-blue-700/60 dark:text-blue-300/50 mt-0.5">
                  {daysSinceLastRead === 1
                    ? "Just 1 day since your last read"
                    : `${daysSinceLastRead} days since your last read`}
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-blue-600 dark:text-blue-400 shrink-0">
                READ NOW
              </span>
            </div>
          </Link>
        </div>
      </section>
    );
  }

  if (streak === 0 && todayChapters === 0) return null;

  const hasReadToday = todayChapters > 0;

  if (streakAtRisk) {
    return (
      <section className="pb-4">
        <div className="container max-w-2xl mx-auto px-6">
          <Link href="/bible" className="block">
            <div className="flex items-center gap-4 rounded-2xl border border-orange-300/40 bg-orange-50/70 dark:bg-orange-950/15 dark:border-orange-500/15 px-5 py-4 card-hover">
              <div className="relative shrink-0">
                <Flame className="h-7 w-7 text-orange-500 animate-pulse-fire" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-heading font-semibold text-orange-900 dark:text-orange-200">
                  Don&apos;t lose your {streak}-day streak!
                </p>
                <p className="text-xs text-orange-700/60 dark:text-orange-300/50 mt-0.5">
                  Read a chapter today to keep it alive
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-orange-600 dark:text-orange-400 shrink-0">
                READ NOW
              </span>
            </div>
          </Link>
        </div>
      </section>
    );
  }

  if (hasReadToday && streak >= 2) {
    return (
      <section className="pb-4">
        <div className="container max-w-2xl mx-auto px-6">
          <div className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-primary/5 px-5 py-3.5">
            <Flame className={cn("h-5 w-5 text-orange-500", streak >= 7 && "text-red-500")} />
            <p className="text-[15px] font-heading font-semibold">
              {streak}-day streak
            </p>
            <span className="text-[10px] font-mono text-muted-foreground">
              {todayChapters} chapter{todayChapters !== 1 ? "s" : ""} today
            </span>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
