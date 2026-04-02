"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, BookOpen, TrendingUp, ArrowRight } from "lucide-react";

export function ProgressSummary() {
  const { isSignedIn } = useUser();
  const stats = useQuery(api.stats.get, isSignedIn ? {} : "skip");

  if (!isSignedIn) return null;
  if (stats === undefined) return <ProgressSummarySkeleton />;
  if (!stats) return null;

  const overallPercent = Math.round(
    (stats.chaptersRead / stats.totalBibleChapters) * 100
  );

  return (
    <section className="pb-4">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
            Your Progress
          </p>
          <Link
            href="/stats"
            className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            Details <ArrowRight className="h-2.5 w-2.5" />
          </Link>
        </div>

        {/* Stat chips */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-heading font-bold text-lg leading-none">{stats.streak}</span>
            <span className="text-[10px] text-muted-foreground font-mono">day{stats.streak !== 1 ? "s" : ""}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-heading font-bold text-lg leading-none">{stats.chaptersRead}</span>
            <span className="text-[10px] text-muted-foreground font-mono">chapters</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="font-heading font-bold text-lg leading-none">{overallPercent}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.max(overallPercent, 1)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono mt-1 text-right">
            {stats.chaptersRead}/{stats.totalBibleChapters} chapters
          </p>
        </div>
      </div>
    </section>
  );
}

function ProgressSummarySkeleton() {
  return (
    <section className="pb-6">
      <div className="container max-w-2xl mx-auto px-6">
        <Skeleton className="h-3 w-28 mb-4" />
        <div className="flex items-center gap-5 mb-4">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-14" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </section>
  );
}
