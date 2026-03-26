"use client";

import Link from "next/link";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  ArrowRight,
  CheckCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";

const PLANS = [
  {
    name: "30 Days of Psalms",
    slug: "30-day-psalms",
    description:
      "Read through the Psalms in 30 days. Five chapters a day of worship, prayer, and praise.",
    days: 30,
    category: "Devotional",
    firstReading: "/bible/psalms/1",
  },
  {
    name: "Gospels in 30 Days",
    slug: "gospels-30",
    description:
      "Walk through the life of Jesus in Matthew, Mark, Luke, and John over 30 days.",
    days: 30,
    category: "Foundations",
    firstReading: "/bible/matthew/1",
  },
  {
    name: "Proverbs — Wisdom for Life",
    slug: "proverbs-31",
    description:
      "One chapter of Proverbs each day for 31 days. Practical wisdom for every area of life.",
    days: 31,
    category: "Wisdom",
    firstReading: "/bible/proverbs/1",
  },
  {
    name: "New Testament in 90 Days",
    slug: "nt-90",
    description:
      "Read through the entire New Testament in three months — roughly 3 chapters a day.",
    days: 90,
    category: "Survey",
    firstReading: "/bible/matthew/1",
  },
  {
    name: "Bible in a Year",
    slug: "bible-365",
    description:
      "Read the entire Bible in 365 days. Three to four chapters daily from Old and New Testament.",
    days: 365,
    category: "Complete",
    firstReading: "/bible/genesis/1",
  },
  {
    name: "Romans Deep Dive",
    slug: "romans-deep",
    description:
      "Study the book of Romans over 16 days — one chapter per day with time to reflect.",
    days: 16,
    category: "Study",
    firstReading: "/bible/romans/1",
  },
];

export default function PlansPage() {
  const { isAuthenticated } = useConvexAuth();
  const userPlans = useQuery(
    api.readingPlans.getUserPlans,
    isAuthenticated ? {} : "skip"
  );
  const startPlan = useMutation(api.readingPlans.startPlan);
  const advanceDay = useMutation(api.readingPlans.advanceDay);
  const resetPlan = useMutation(api.readingPlans.resetPlan);

  const getUserPlan = (slug: string) =>
    userPlans?.find((p) => p.planSlug === slug);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <p className="text-primary text-lg mb-2">✦</p>
        <h1 className="text-2xl md:text-3xl font-heading font-semibold mb-2">
          Reading Plans
        </h1>
        <p className="text-muted-foreground italic max-w-md mx-auto">
          Guided journeys through scripture — pick a plan and stay consistent
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLANS.map((plan) => {
          const userPlan = getUserPlan(plan.slug);
          const isCompleted =
            userPlan && userPlan.currentDay >= plan.days;
          const progress = userPlan
            ? Math.round((userPlan.currentDay / plan.days) * 100)
            : 0;

          return (
            <Card
              key={plan.slug}
              className="transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary" className="text-xs font-mono">
                    {plan.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                    <Calendar className="h-3 w-3" />
                    {plan.days} days
                  </div>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {plan.description}
                </p>

                {/* Progress bar */}
                {userPlan && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        Day {userPlan.currentDay} of {plan.days}
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {!isAuthenticated ? (
                  <Link href={plan.firstReading}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 w-full"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Start Reading
                      <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                    </Button>
                  </Link>
                ) : isCompleted ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 flex-1"
                      disabled
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      Completed
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resetPlan({ planSlug: plan.slug })}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : userPlan ? (
                  <div className="flex gap-2">
                    <Link href={plan.firstReading} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 w-full"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Continue
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => advanceDay({ planSlug: plan.slug })}
                    >
                      +1 Day
                    </Button>
                  </div>
                ) : userPlans === undefined ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 w-full"
                    disabled
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading…
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 w-full"
                    onClick={() =>
                      startPlan({
                        planSlug: plan.slug,
                        totalDays: plan.days,
                      })
                    }
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Start Plan
                    <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
