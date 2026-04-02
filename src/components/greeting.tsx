"use client";

import { useUser } from "@clerk/nextjs";

const MOTIVATIONAL_LINES: Record<string, string> = {
  earlyMorning: "Quiet moments with God's Word.",
  morning: "Start your day in the Word.",
  afternoon: "Take a moment to reflect.",
  evening: "Wind down with scripture.",
  night: "Rest in His promises tonight.",
};

function getTimeSlot(hour: number) {
  if (hour < 6) return "earlyMorning";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function getGreetingText(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Greeting() {
  const { user, isSignedIn } = useUser();

  const hour = new Date().getHours();
  const greeting = getGreetingText(hour);
  const name = isSignedIn ? user?.firstName : null;
  const motivational = MOTIVATIONAL_LINES[getTimeSlot(hour)];

  return (
    <section className="pb-2">
      <div className="container max-w-2xl mx-auto px-6">
        <p className="text-2xl md:text-3xl font-heading font-semibold tracking-tight">
          {greeting}
          {name ? `, ${name}` : ""}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{motivational}</p>
      </div>
    </section>
  );
}
