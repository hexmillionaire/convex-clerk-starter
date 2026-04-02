"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  current: number;
  goal: number;
};

/**
 * Compact inline daily goal ring for the homepage.
 * Shows circular progress + "X/Y" + motivational text.
 * Links to /bible when not complete, /stats when complete.
 */
export function HomeDailyGoal({ current, goal }: Props) {
  const percent = Math.min(Math.round((current / goal) * 100), 100);
  const completed = current >= goal;
  const size = 52;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const center = size / 2;

  const href = completed ? "/stats" : "/bible";
  const label = completed
    ? "Goal complete!"
    : `${goal - current} chapter${goal - current !== 1 ? "s" : ""} to go`;

  return (
    <section className="pb-3">
      <div className="container max-w-2xl mx-auto px-4">
        <Link href={href} className="group block">
          <div className="flex items-center gap-3.5 rounded-lg border bg-card px-4 py-3 transition-all hover:shadow-sm active:scale-[0.99]">
            {/* Ring */}
            <div className={cn("relative shrink-0", completed && "goal-complete-glow rounded-full")} style={{ width: size, height: size }}>
              <svg width={size} height={size} className="-rotate-90">
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-muted"
                />
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className={cn(
                    "transition-[stroke-dashoffset] duration-700 ease-out",
                    completed ? "text-green-500" : "text-primary"
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn(
                  "text-xs font-heading font-bold",
                  completed && "text-green-600"
                )}>
                  {current}/{goal}
                </span>
              </div>
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">
                Today&apos;s Goal
              </p>
              <p className={cn(
                "text-[15px] font-heading font-semibold",
                completed && "text-green-600"
              )}>
                {label}
              </p>
            </div>

            {/* Emoji feedback */}
            <span className="text-lg shrink-0" role="img" aria-label={completed ? "celebration" : "progress"}>
              {completed ? "🎉" : percent >= 50 ? "💪" : "📖"}
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
