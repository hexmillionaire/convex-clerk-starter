import { query } from "./_generated/server";

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
    const readDates: string[] = [];
    for (const p of progress) {
      const d = new Date(p._creationTime);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (ds === todayStr) todayChapters++;
      if (!readDates.includes(ds)) readDates.push(ds);
    }
    readDates.sort().reverse();

    // Streak calculation (same logic as get)
    let streak = 0;
    if (readDates.length > 0) {
      const checkDate = new Date(today);
      if (readDates[0] !== todayStr) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
        if (readDates[0] === yesterdayStr) {
          const d = new Date(checkDate);
          for (const dateStr of readDates) {
            const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            if (dateStr === expected) { streak++; d.setDate(d.getDate() - 1); }
            else if (dateStr < expected) break;
          }
        }
      } else {
        const d = new Date(today);
        for (const dateStr of readDates) {
          const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          if (dateStr === expected) { streak++; d.setDate(d.getDate() - 1); }
          else if (dateStr < expected) break;
        }
      }
    }

    // Is streak at risk? (had streak yesterday but nothing today)
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

    // Days since last read (for streak recovery UI)
    let daysSinceLastRead = -1;
    if (readDates.length > 0) {
      const lastDate = readDates[0]; // Most recent date (sorted desc)
      const lastRead = new Date(lastDate + "T12:00:00Z");
      daysSinceLastRead = Math.floor(
        (today.getTime() - lastRead.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

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
    const readDates = progress
      .map((p) => {
        const d = new Date(p._creationTime);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
      .filter((d, i, arr) => arr.indexOf(d) === i)
      .sort()
      .reverse();

    let streak = 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Check if read today or yesterday to start counting
    if (readDates.length > 0) {
      const checkDate = new Date(today);
      // Allow streak to start from today or yesterday
      if (readDates[0] !== todayStr) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
        if (readDates[0] !== yesterdayStr) {
          streak = 0;
        } else {
          // Count from yesterday backwards
          const d = new Date(checkDate);
          for (const dateStr of readDates) {
            const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            if (dateStr === expected) {
              streak++;
              d.setDate(d.getDate() - 1);
            } else if (dateStr < expected) {
              break;
            }
          }
        }
      } else {
        // Count from today backwards
        const d = new Date(today);
        for (const dateStr of readDates) {
          const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          if (dateStr === expected) {
            streak++;
            d.setDate(d.getDate() - 1);
          } else if (dateStr < expected) {
            break;
          }
        }
      }
    }

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
