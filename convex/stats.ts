import { query } from "./_generated/server";
import { calculateStreak } from "./lib/streak";

/**
 * Lightweight query for homepage retention widgets.
 * Returns streak, todayChapters, dailyGoal, chaptersRead, and uncelebrated milestones.
 */
export const homeStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.tokenIdentifier;

    const progress = await ctx.db
      .query("readingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalBibleChapters = 1189;
    const chaptersRead = progress.length;

    // Today's date string
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Count chapters read today
    let todayChapters = 0;
    const readDateSet = new Set<string>();
    for (const p of progress) {
      const d = new Date(p._creationTime);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (ds === todayStr) todayChapters++;
      readDateSet.add(ds);
    }
    const readDates = [...readDateSet].sort().reverse();

    // Streak with a 1-day grace period (see convex/lib/streak.ts).
    const { streak, daysSinceLastRead } = calculateStreak(readDates, today);

    // Is streak at risk? (had streak but nothing today)
    const streakAtRisk = streak > 0 && todayChapters === 0;

    // Daily goal from settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const dailyGoal = settings?.dailyGoal ?? 1;

    // Uncelebrated milestones
    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    const uncelebrated = milestones
      .filter((m) => !m.celebratedAt)
      .slice(0, 3);

    return {
      streak,
      streakAtRisk,
      todayChapters,
      dailyGoal,
      chaptersRead,
      totalBibleChapters,
      uncelebrated,
      daysSinceLastRead,
    };
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.tokenIdentifier;

    const progress = await ctx.db
      .query("readingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const highlights = await ctx.db
      .query("highlights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const journal = await ctx.db
      .query("journal")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Total chapters in Bible: 1189
    const totalBibleChapters = 1189;
    const chaptersRead = progress.length;

    // Get unique books read
    const booksRead = new Set(progress.map((p) => p.bookSlug)).size;

    // Calculate reading streak from creation times
    const readDateSet = new Set<string>();
    for (const p of progress) {
      const d = new Date(p._creationTime);
      readDateSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    }
    const readDates = [...readDateSet].sort().reverse();

    // Streak with a 1-day grace period (see convex/lib/streak.ts).
    const { streak } = calculateStreak(readDates, new Date());

    // Per-book progress
    const bookProgress: Record<string, number> = {};
    for (const p of progress) {
      bookProgress[p.bookSlug] = (bookProgress[p.bookSlug] ?? 0) + 1;
    }

    return {
      chaptersRead,
      totalBibleChapters,
      booksRead,
      totalBooks: 66,
      streak,
      totalBookmarks: bookmarks.length,
      totalHighlights: highlights.length,
      totalJournalEntries: journal.length,
      bookProgress,
    };
  },
});

/**
 * Weekly stats for the homepage recap card.
 * Returns null if user has no activity this week.
 */
export const weeklyRecap = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.tokenIdentifier;

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const progress = await ctx.db
      .query("readingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let thisWeekChapters = 0;
    let lastWeekChapters = 0;
    const thisWeekBooks = new Set<string>();
    const thisWeekDays = new Set<string>();

    for (const p of progress) {
      const d = new Date(p._creationTime);
      if (d >= weekStart) {
        thisWeekChapters++;
        thisWeekBooks.add(p.bookSlug);
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        thisWeekDays.add(ds);
      } else if (d >= lastWeekStart) {
        lastWeekChapters++;
      }
    }

    // Don't show recap if no activity this week
    if (thisWeekChapters === 0) return null;

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const thisWeekBookmarks = bookmarks.filter(
      (b) => new Date(b._creationTime) >= weekStart
    ).length;

    return {
      chaptersRead: thisWeekChapters,
      lastWeekChapters,
      booksExplored: thisWeekBooks.size,
      versesBookmarked: thisWeekBookmarks,
      daysActive: thisWeekDays.size,
    };
  },
});
