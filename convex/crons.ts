import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Daily verse at 8:00 AM UTC (3 AM EST / 12 AM PST)
crons.cron("send daily verse", "0 8 * * *", internal.cronActions.sendDailyVerse, {});

// Streak reminder at 9:00 PM UTC (4 PM EST / 1 PM PST)
crons.cron("send streak reminder", "0 21 * * *", internal.cronActions.sendStreakReminder, {});

export default crons;
