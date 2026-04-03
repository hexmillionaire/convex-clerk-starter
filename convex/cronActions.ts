"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Daily verse notification — called by cron at 8 AM UTC
export const sendDailyVerse = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const NOTIFICATION_VERSES = [
      { ref: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son..." },
      { ref: "Psalm 23:1", text: "The LORD is my shepherd; I shall not want." },
      { ref: "Proverbs 3:5-6", text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding." },
      { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me." },
      { ref: "Romans 8:28", text: "And we know that all things work together for good to them that love God..." },
      { ref: "Isaiah 41:10", text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God..." },
      { ref: "Jeremiah 29:11", text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace..." },
      { ref: "Matthew 11:28", text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." },
      { ref: "Psalm 46:10", text: "Be still, and know that I am God." },
      { ref: "Joshua 1:9", text: "Be strong and of a good courage; be not afraid..." },
      { ref: "Psalm 119:105", text: "Thy word is a lamp unto my feet, and a light unto my path." },
      { ref: "Hebrews 11:1", text: "Now faith is the substance of things hoped for, the evidence of things not seen." },
      { ref: "Psalm 27:1", text: "The LORD is my light and my salvation; whom shall I fear?" },
      { ref: "2 Timothy 1:7", text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." },
      { ref: "Psalm 37:4", text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart." },
      { ref: "Lamentations 3:22-23", text: "His compassions fail not. They are new every morning: great is thy faithfulness." },
      { ref: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble." },
      { ref: "Romans 15:13", text: "Now the God of hope fill you with all joy and peace in believing..." },
      { ref: "Psalm 34:8", text: "O taste and see that the LORD is good." },
      { ref: "1 Peter 5:7", text: "Casting all your care upon him; for he careth for you." },
      { ref: "Psalm 91:1-2", text: "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty." },
      { ref: "Matthew 6:33", text: "But seek ye first the kingdom of God, and his righteousness..." },
      { ref: "Isaiah 40:31", text: "They that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles." },
      { ref: "Psalm 121:1-2", text: "My help cometh from the LORD, which made heaven and earth." },
      { ref: "Romans 5:8", text: "While we were yet sinners, Christ died for us." },
      { ref: "Psalm 139:14", text: "I am fearfully and wonderfully made." },
      { ref: "James 1:5", text: "If any of you lack wisdom, let him ask of God..." },
      { ref: "Psalm 118:24", text: "This is the day which the LORD hath made; we will rejoice and be glad in it." },
      { ref: "John 14:27", text: "Peace I leave with you, my peace I give unto you." },
      { ref: "Psalm 30:5", text: "Weeping may endure for a night, but joy cometh in the morning." },
      { ref: "Micah 6:8", text: "What doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?" },
    ];

    const verse = NOTIFICATION_VERSES[dayOfYear % NOTIFICATION_VERSES.length];

    await ctx.runAction(internal.pushSend.sendToAll, {
      title: `✦ ${verse.ref}`,
      body: verse.text,
      url: "/verse-of-the-day",
      tag: "daily-verse",
    });
  },
});

// Streak reminder — called by cron at 9 PM UTC
export const sendStreakReminder = internalAction({
  args: {},
  handler: async (ctx) => {
    await ctx.runAction(internal.pushSend.sendToAll, {
      title: "📖 Keep your streak alive!",
      body: "Read a chapter today to continue your reading streak.",
      url: "/bible",
      tag: "streak-reminder",
    });
  },
});
