import { query } from "./_generated/server";

export const get = query({
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
