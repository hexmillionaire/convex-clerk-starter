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
  })
    .index("by_user", ["userId"])
    .index("by_user_chapter", ["userId", "bookSlug", "chapter"]),

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
    .index("by_user_book", ["userId", "bookSlug"]),

  // ─── Reading plan progress ───
  userReadingPlans: defineTable({
    userId: v.string(),
    planSlug: v.string(),
    currentDay: v.number(),
    startedAt: v.number(), // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_user_plan", ["userId", "planSlug"]),
});
