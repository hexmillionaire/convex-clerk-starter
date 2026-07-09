import { query } from "./_generated/server";
import { calculateStreak } from "./lib/streak";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.tokenIdentifier;

    // Recent bookmarks (latest 5)
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);

    // All highlights (for count + recent)
    const allHighlights = await ctx.db
      .query("highlights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    const recentHighlights = allHighlights.slice(0, 10);

    // Highlights store their own text/reference snapshot (the `verses` table is not
    // populated — scripture is read from the external API), so use those directly.
    const highlightsWithText = recentHighlights.map((h) => ({
      _id: h._id,
      _creationTime: h._creationTime,
      bookSlug: h.bookSlug,
      chapter: h.chapter,
      verseNumber: h.verseNumber,
      color: h.color,
      note: h.note,
      reference: h.reference ?? `${h.bookSlug} ${h.chapter}:${h.verseNumber}`,
      text: h.text ?? "",
    }));

    // All progress for stats + calendar
    const allProgress = await ctx.db
      .query("readingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Reading history (last 8 chapters read)
    const recentHistory = await ctx.db
      .query("readingProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(8);

    const lastRead = recentHistory[0] ?? null;

    // Reading plans
    const plans = await ctx.db
      .query("userReadingPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Journal entries (recent 3 + total count)
    const allJournal = await ctx.db
      .query("journal")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    const recentJournal = allJournal.slice(0, 3);

    // Prayer journal (recent 3 + counts)
    const allPrayers = await ctx.db
      .query("prayerJournal")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    const recentPrayers = allPrayers.slice(0, 3);
    const activePrayers = allPrayers.filter((p) => !p.answered).length;
    const answeredPrayers = allPrayers.filter((p) => p.answered).length;

    // User settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Milestones (uncelebrated first)
    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    const uncelebrated = milestones.filter((m) => !m.celebratedAt);

    // Calculate streak
    const readDateSet = new Set<string>();
    for (const p of allProgress) {
      const d = new Date(p._creationTime);
      readDateSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    }
    const readDates = [...readDateSet].sort().reverse();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Streak with a 1-day grace period (see convex/lib/streak.ts).
    const { streak } = calculateStreak(readDates, today);

    // Today's chapters read (for daily goal tracking)
    const todayChapters = allProgress.filter((p) => {
      const d = new Date(p._creationTime);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return ds === todayStr;
    }).length;

    // Per-book progress for book progress cards
    const bookProgress: Record<string, number> = {};
    for (const p of allProgress) {
      bookProgress[p.bookSlug] = (bookProgress[p.bookSlug] ?? 0) + 1;
    }

    // Bookmark collections summary
    const allBookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const collectionCounts: Record<string, number> = {};
    for (const bm of allBookmarks) {
      const col = bm.collection ?? "Uncategorized";
      collectionCounts[col] = (collectionCounts[col] ?? 0) + 1;
    }

    // Reading calendar data (last 90 days of dates with chapter counts)
    const calendarData: Record<string, number> = {};
    for (const p of allProgress) {
      const d = new Date(p._creationTime);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      calendarData[ds] = (calendarData[ds] ?? 0) + 1;
    }

    return {
      bookmarks,
      highlights: highlightsWithText,
      lastRead,
      recentHistory,
      chaptersRead: allProgress.length,
      totalBibleChapters: 1189,
      streak,
      totalBookmarks: allBookmarks.length,
      totalHighlights: allHighlights.length,
      totalJournalEntries: allJournal.length,
      recentJournal,
      recentPrayers,
      activePrayers,
      answeredPrayers,
      totalPrayers: allPrayers.length,
      plans,
      settings,
      todayChapters,
      bookProgress,
      collectionCounts,
      calendarData,
      milestones: milestones.slice(0, 10),
      uncelebratedMilestones: uncelebrated,
      readDates,
    };
  },
});
