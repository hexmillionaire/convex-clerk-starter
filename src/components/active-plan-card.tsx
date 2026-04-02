"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookMarked, ArrowRight, CheckCircle } from "lucide-react";
import { getTodayReading, getPlanSchedule } from "@/lib/plan-schedules";

const PLAN_NAMES: Record<string, string> = {
  "30-day-psalms": "30 Days of Psalms",
  "gospels-30": "Gospels in 30 Days",
  "proverbs-31": "Proverbs — Wisdom for Life",
  "nt-90": "New Testament in 90 Days",
  "bible-365": "Bible in a Year",
  "romans-deep": "Romans Deep Dive",
};

export function ActivePlanCard() {
  const { isSignedIn } = useUser();
  const userPlans = useQuery(api.readingPlans.getUserPlans, isSignedIn ? {} : "skip");

  if (!isSignedIn) return <BrowsePlansCard />;
  if (userPlans === undefined) return <ActivePlanSkeleton />;

  // Find the most recently active plan
  const activePlan = userPlans
    .toSorted((a, b) => b.startedAt - a.startedAt)
    [0];

  if (!activePlan) return <BrowsePlansCard />;

  const schedule = getPlanSchedule(activePlan.planSlug);
  const totalDays = schedule.length;
  const isComplete = activePlan.currentDay > totalDays;
  const todayReading = getTodayReading(activePlan.planSlug, activePlan.currentDay);
  const planName = PLAN_NAMES[activePlan.planSlug] ?? activePlan.planSlug;
  const progressPercent = Math.round(((activePlan.currentDay - 1) / totalDays) * 100);

  // Build href to today's first chapter
  const readHref = todayReading?.chapters?.[0]
    ? `/bible/${todayReading.chapters[0].bookSlug}/${todayReading.chapters[0].chapter}`
    : "/plans";

  if (isComplete) {
    return (
      <section className="pb-8">
        <div className="container max-w-2xl mx-auto px-6">
          <Card className="border-green-500/15 bg-green-50/30 dark:bg-green-950/10 rounded-2xl">
            <CardContent className="p-5 md:p-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading font-semibold text-[15px]">{planName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Completed! Start a new plan?</p>
              </div>
              <Link href="/plans" className="text-xs font-mono uppercase tracking-wider text-primary hover:underline shrink-0">
                Browse
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-6">
      <div className="container max-w-2xl mx-auto px-4">
        <Link href={readHref} className="group block">
          <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <BookMarked className="h-4 w-4 text-primary shrink-0" />
                  <p className="font-heading font-semibold text-sm truncate">{planName}</p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                  Day {activePlan.currentDay}/{totalDays}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(progressPercent, 2)}%` }}
                />
              </div>

              {todayReading && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Today: <span className="text-foreground font-medium">{todayReading.label}</span>
                  </p>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
}

function ActivePlanSkeleton() {
  return (
    <section className="pb-8">
      <div className="container max-w-2xl mx-auto px-6">
        <Card className="rounded-2xl">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full mb-4" />
            <Skeleton className="h-4 w-28" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function BrowsePlansCard() {
  return (
    <section className="pb-8">
      <div className="container max-w-2xl mx-auto px-6">
        <Link href="/plans" className="group block">
          <Card className="rounded-2xl card-hover border-dashed">
            <CardContent className="p-5 md:p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BookMarked className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-[15px]">Start a Reading Plan</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Build a daily scripture habit</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
}
