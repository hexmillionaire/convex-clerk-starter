import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Bible verses (seeded data) ───
  verses: defineTable({
    bookId: v.number(), // 1-66
    bookName: v.string(),
    bookSlug: v.string(),
    chapter: v.number(),
    verseNumber: v.number(),
    text: v.string(),
    translation: v.string(), // "KJV", "WEB", "ASV"
  })
    .index("by_chapter", ["bookSlug", "chapter", "translation"])
    .index("by_chapter_and_verse", ["bookSlug", "chapter", "translation", "verseNumber"])
    .index("by_translation", ["translation"])
    .searchIndex("search_text", { searchField: "text" }),

  // ─── User bookmarks ───
  bookmarks: defineTable({
    userId: v.string(),
    bookSlug: v.string(),
    chapter: v.number(),
    verseNumber: v.number(),
    reference: v.string(), // "John 3:16"
    text: v.string(),
    collection: v.optional(v.string()), // e.g. "Favorites", "Promises"
  })
    .index("by_user", ["userId"])
    .index("by_user_verse", ["userId", "bookSlug", "chapter", "verseNumber"]),

  // ─── User highlights ───
  highlights: defineTable({
    userId: v.string(),
    bookSlug: v.string(),
    chapter: v.number(),
    verseNumber: v.number(),
    color: v.string(),
    note: v.optional(v.string()), // personal note on highlight
    text: v.optional(v.string()), // verse text snapshot (so it can be shown without re-fetching)
    reference: v.optional(v.string()), // e.g. "John 3:16"
  })
    .index("by_user", ["userId"])
    .index("by_user_chapter", ["userId", "bookSlug", "chapter"])
    .index("by_user_verse", ["userId", "bookSlug", "chapter", "verseNumber"]),

  // ─── Devotional journal ───
  journal: defineTable({
    userId: v.string(),
    title: v.string(),
    passage: v.string(),
    content: v.string(),
  }).index("by_user", ["userId"]),

  // ─── Reading progress ───
  readingProgress: defineTable({
    userId: v.string(),
    bookSlug: v.string(),
    chapter: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_book", ["userId", "bookSlug"])
    .index("by_user_book_chapter", ["userId", "bookSlug", "chapter"]),

  // ─── Reading plan progress ───
  userReadingPlans: defineTable({
    userId: v.string(),
    planSlug: v.string(),
    currentDay: v.number(),
    startedAt: v.number(), // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_user_plan", ["userId", "planSlug"]),

  // ─── User settings (daily goal, reminders) ───
  userSettings: defineTable({
    userId: v.string(),
    dailyGoal: v.number(), // chapters per day
    reminderEnabled: v.optional(v.boolean()),
    reminderTime: v.optional(v.string()), // "HH:MM" e.g. "07:00"
  }).index("by_user", ["userId"]),

  // ─── Prayer journal ───
  prayerJournal: defineTable({
    userId: v.string(),
    request: v.string(),
    category: v.string(), // "personal", "family", "community", "praise", "other"
    answered: v.boolean(),
    answeredNote: v.optional(v.string()),
    answeredAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // ─── Milestones (achievements) ───
  milestones: defineTable({
    userId: v.string(),
    type: v.string(), // "chapters_read", "streak", "books_completed", "bookmarks", "journal_entries"
    value: v.number(), // threshold reached
    celebratedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "type"]),

  // ─── Push notification subscriptions ───
  pushSubscriptions: defineTable({
    userId: v.string(),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),
});
