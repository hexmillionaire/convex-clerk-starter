/**
 * Reading-streak calculation, shared by `dashboard.get`, `stats.get`, and
 * `stats.homeStats` (previously three divergent copies).
 *
 * Grace model (`graceDays`, default 1 — "streak freeze"): the streak is a run of
 * days on which the user read, tolerating single missed days. A gap of one
 * missed day between two read days keeps the run alive; two consecutive missed
 * days ends it. `streak` counts the actual read days in the run (missed days are
 * not counted). The run is considered active "as of today" if the most recent
 * read was within `graceDays + 1` days.
 */

/** Local day number for a `YYYY-MM-DD` string (days since Unix epoch, UTC-normalized). */
function dayNumberFromString(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Local day number for a Date, using its local Y/M/D (matches how the app builds date strings). */
function dayNumberFromDate(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000
  );
}

export type StreakResult = {
  /** Number of read days in the current run (0 if the run has lapsed). */
  streak: number;
  /** Whether the run is still alive as of `today` (may be at risk but recoverable). */
  streakActive: boolean;
  /** Whole days between the most recent read and today (-1 if never read). */
  daysSinceLastRead: number;
};

export function calculateStreak(
  readDates: string[],
  today: Date,
  graceDays = 1
): StreakResult {
  if (readDates.length === 0) {
    return { streak: 0, streakActive: false, daysSinceLastRead: -1 };
  }

  // Unique day numbers, most-recent first.
  const days = [...new Set(readDates.map(dayNumberFromString))].sort((a, b) => b - a);
  const todayNum = dayNumberFromDate(today);
  const daysSinceLastRead = todayNum - days[0];

  // Largest allowed gap between two consecutive read days (1 = adjacent).
  const maxGap = graceDays + 1;

  // If the last read is too far in the past, the run has lapsed.
  const streakActive = daysSinceLastRead >= 0 && daysSinceLastRead <= maxGap;
  if (!streakActive) {
    return { streak: 0, streakActive: false, daysSinceLastRead };
  }

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = days[i - 1] - days[i];
    if (gap <= maxGap) {
      streak++;
    } else {
      break;
    }
  }

  return { streak, streakActive: true, daysSinceLastRead };
}
