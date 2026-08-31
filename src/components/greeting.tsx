"use client";

import { useSyncExternalStore } from "react";
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

/** The clock is read once per render; nothing pushes updates to it. */
const subscribeToNothing = () => () => {};

function getGreetingText(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Greeting() {
  const { user, isSignedIn } = useUser();

  // The greeting depends on the reader's local clock, which the server can't
  // know — rendering it server-side would guess UTC and mismatch on hydration.
  // The server snapshot is time-neutral; the real hour applies on hydration.
  // The name arrives with Clerk a moment later regardless, so this is the same
  // one-step reveal the greeting always had.
  const hour = useSyncExternalStore(
    subscribeToNothing,
    () => new Date().getHours(),
    () => null
  );

  const greeting = hour === null ? "Welcome" : getGreetingText(hour);
  const motivational =
    hour === null ? "A moment in the Word." : MOTIVATIONAL_LINES[getTimeSlot(hour)];
  const name = isSignedIn ? user?.firstName : null;

  return (
    <section className="pb-2">
      <div className="container max-w-2xl mx-auto px-6">
        <p className="text-2xl md:text-3xl font-heading font-semibold tracking-tight text-balance">
          {greeting}
          {name ? `, ${name}` : ""}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{motivational}</p>
      </div>
    </section>
  );
}
