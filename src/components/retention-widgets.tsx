"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { StreakBanner } from "@/components/streak-banner";
import { HomeDailyGoal } from "@/components/home-daily-goal";
import { MilestoneCelebration } from "@/components/milestone-celebration";
import { OnboardingCta } from "@/components/onboarding-cta";
import { NotificationPrompt } from "@/components/notification-prompt";

/**
 * Orchestrates all Duolingo-style retention widgets on the homepage.
 * - Signed out: shows OnboardingCta
 * - Signed in: shows StreakBanner, DailyGoal, NotificationPrompt, MilestoneCelebration
 */
export function RetentionWidgets() {
  const { isSignedIn } = useUser();
  const homeStats = useQuery(
    api.stats.homeStats,
    isSignedIn ? {} : "skip"
  );

  // Unauthenticated — show conversion CTA
  if (!isSignedIn) {
    return <OnboardingCta />;
  }

  // Loading
  if (homeStats === undefined) return null;
  if (!homeStats) return null;

  return (
    <>
      {/* Streak urgency/celebration */}
      <StreakBanner
        streak={homeStats.streak}
        streakAtRisk={homeStats.streakAtRisk}
        todayChapters={homeStats.todayChapters}
      />

      {/* Daily reading goal ring */}
      <HomeDailyGoal
        current={homeStats.todayChapters}
        goal={homeStats.dailyGoal}
      />

      {/* Notification opt-in (delayed, dismissible) */}
      <NotificationPrompt />

      {/* Milestone celebration modal (if uncelebrated milestones exist) */}
      {homeStats.uncelebrated.length > 0 && (
        <MilestoneCelebration milestones={homeStats.uncelebrated} />
      )}
    </>
  );
}
