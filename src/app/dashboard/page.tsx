"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BIBLE_BOOKS, HIGHLIGHT_COLORS } from "@/lib/bible-data";
import { getTodayReading } from "@/lib/plan-schedules";
import { StreakCalendar } from "@/components/streak-calendar";
import { DailyGoalRing } from "@/components/daily-goal-ring";
import {
  BookOpen,
  Flame,
  Bookmark,
  Highlighter,
  PenLine,
  TrendingUp,
  Calendar,
  ArrowRight,
  ArrowLeft,
  LogOut,
  Loader2,
  Lock,
  BookMarked,
  BarChart3,
  Clock,
  HandHeart,
  Trophy,
  Share2,
  Settings,
  Sparkles,
  Target,
  Bell,
  FolderOpen,
  MessageSquare,
  Star,
  User,
  Trash2,
  Heart,
} from "lucide-react";

// ─── VOTD data ───
const DAILY_VERSES = [
  { ref: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", book: "john", chapter: 3, verse: 16 },
  { ref: "Psalm 23:1", text: "The LORD is my shepherd; I shall not want.", book: "psalms", chapter: 23, verse: 1 },
  { ref: "Proverbs 3:5-6", text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.", book: "proverbs", chapter: 3, verse: 5 },
  { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me.", book: "philippians", chapter: 4, verse: 13 },
  { ref: "Romans 8:28", text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", book: "romans", chapter: 8, verse: 28 },
  { ref: "Isaiah 41:10", text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.", book: "isaiah", chapter: 41, verse: 10 },
  { ref: "Jeremiah 29:11", text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.", book: "jeremiah", chapter: 29, verse: 11 },
  { ref: "Matthew 11:28", text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", book: "matthew", chapter: 11, verse: 28 },
  { ref: "Psalm 46:10", text: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.", book: "psalms", chapter: 46, verse: 10 },
  { ref: "Joshua 1:9", text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.", book: "joshua", chapter: 1, verse: 9 },
  { ref: "Psalm 119:105", text: "Thy word is a lamp unto my feet, and a light unto my path.", book: "psalms", chapter: 119, verse: 105 },
  { ref: "Romans 12:2", text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.", book: "romans", chapter: 12, verse: 2 },
  { ref: "Hebrews 11:1", text: "Now faith is the substance of things hoped for, the evidence of things not seen.", book: "hebrews", chapter: 11, verse: 1 },
  { ref: "Ephesians 2:8-9", text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.", book: "ephesians", chapter: 2, verse: 8 },
  { ref: "Psalm 27:1", text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?", book: "psalms", chapter: 27, verse: 1 },
  { ref: "2 Timothy 1:7", text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.", book: "2-timothy", chapter: 1, verse: 7 },
  { ref: "Psalm 37:4", text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.", book: "psalms", chapter: 37, verse: 4 },
  { ref: "1 Corinthians 13:4-5", text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;", book: "1-corinthians", chapter: 13, verse: 4 },
  { ref: "Galatians 5:22-23", text: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.", book: "galatians", chapter: 5, verse: 22 },
  { ref: "Psalm 91:1-2", text: "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.", book: "psalms", chapter: 91, verse: 1 },
  { ref: "Matthew 6:33", text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.", book: "matthew", chapter: 6, verse: 33 },
  { ref: "Isaiah 40:31", text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", book: "isaiah", chapter: 40, verse: 31 },
  { ref: "Romans 15:13", text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.", book: "romans", chapter: 15, verse: 13 },
  { ref: "Psalm 34:8", text: "O taste and see that the LORD is good: blessed is the man that trusteth in him.", book: "psalms", chapter: 34, verse: 8 },
  { ref: "Colossians 3:23", text: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men;", book: "colossians", chapter: 3, verse: 23 },
  { ref: "Proverbs 18:10", text: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.", book: "proverbs", chapter: 18, verse: 10 },
  { ref: "Psalm 139:14", text: "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.", book: "psalms", chapter: 139, verse: 14 },
  { ref: "James 1:5", text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.", book: "james", chapter: 1, verse: 5 },
  { ref: "1 Peter 5:7", text: "Casting all your care upon him; for he careth for you.", book: "1-peter", chapter: 5, verse: 7 },
  { ref: "Psalm 121:1-2", text: "I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth.", book: "psalms", chapter: 121, verse: 1 },
  { ref: "Matthew 5:16", text: "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.", book: "matthew", chapter: 5, verse: 16 },
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const PLAN_INFO: Record<string, { name: string; days: number }> = {
  "30-day-psalms": { name: "30 Days of Psalms", days: 30 },
  "gospels-30": { name: "Gospels in 30 Days", days: 30 },
  "proverbs-31": { name: "Proverbs — Wisdom for Life", days: 31 },
  "nt-90": { name: "New Testament in 90 Days", days: 90 },
  "bible-365": { name: "Bible in a Year", days: 365 },
  "romans-deep": { name: "Romans Deep Dive", days: 16 },
};

const MILESTONE_LABELS: Record<string, (v: number) => string> = {
  chapters_read: (v) => `${v} Chapter${v > 1 ? "s" : ""} Read`,
  streak: (v) => `${v}-Day Streak`,
  books_completed: (v) => `${v} Book${v > 1 ? "s" : ""} Completed`,
  bookmarks: (v) => `${v} Bookmark${v > 1 ? "s" : ""} Saved`,
  journal_entries: (v) => `${v} Journal Entr${v > 1 ? "ies" : "y"} Written`,
};

const BOOK_CHAPTERS: Record<string, number> = {};
for (const b of BIBLE_BOOKS) {
  BOOK_CHAPTERS[b.slug] = b.chapters;
}

function bookName(slug: string) {
  return BIBLE_BOOKS.find((b) => b.slug === slug)?.name ?? slug;
}

function highlightColorName(hex: string) {
  return HIGHLIGHT_COLORS.find((c) => c.value === hex)?.name ?? "Highlight";
}

export default function DashboardPage() {
  const { signOut } = useClerk();
  const { user, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const dashboard = useQuery(
    api.dashboard.get,
    isAuthenticated ? {} : "skip"
  );
  const updateSettings = useMutation(api.userSettings.update);
  const celebrateMilestone = useMutation(api.milestones.celebrate);

  const [showSettings, setShowSettings] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!clerkLoaded) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container max-w-md mx-auto px-4 py-20 text-center">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h1 className="text-xl font-heading font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Sign in to access your personal reading dashboard.
        </p>
        <Link href="/login">
          <Button className="gap-2">Sign In to Continue</Button>
        </Link>
      </div>
    );
  }

  if (dashboard === undefined) {
    if (isSignedIn && !isAuthenticated) {
      return (
        <div className="container max-w-md mx-auto px-4 py-20 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-4" />
          <p className="text-sm text-muted-foreground">
            Connecting to your account...
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            If this takes more than a few seconds, try signing out and back in.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => signOut({ redirectUrl: "/login" })}
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign Out & Retry
          </Button>
        </div>
      );
    }
    return (
      <div className="container max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground mt-2">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (!dashboard) return null;

  const overallPercent = Math.round(
    (dashboard.chaptersRead / dashboard.totalBibleChapters) * 100
  );

  const activePlans = dashboard.plans.filter((p) => {
    const info = PLAN_INFO[p.planSlug];
    return info && p.currentDay <= info.days;
  });

  const todayVerse = DAILY_VERSES[getDayOfYear() % DAILY_VERSES.length];
  const dailyGoal = dashboard.settings?.dailyGoal ?? 1;
  const hasReadToday = dashboard.todayChapters > 0;

  // Books with any progress
  const booksWithProgress = Object.entries(dashboard.bookProgress)
    .filter(([slug]) => BOOK_CHAPTERS[slug])
    .map(([slug, read]) => ({
      slug,
      name: bookName(slug),
      read,
      total: BOOK_CHAPTERS[slug],
      percent: Math.round((read / BOOK_CHAPTERS[slug]) * 100),
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 12);

  // Share progress text
  const shareText = `I've read ${dashboard.chaptersRead} chapters of the Bible (${overallPercent}%) with a ${dashboard.streak}-day streak on Divine Word!`;

  const handleSaveSettings = async () => {
    const goal = parseInt(goalInput) || dailyGoal;
    try {
      await updateSettings({
        dailyGoal: Math.max(1, Math.min(50, goal)),
        reminderEnabled,
        reminderTime: reminderTime || undefined,
      });
      setShowSettings(false);
    } catch {
      // Settings save failed silently
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      {/* Header with user info */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-heading font-semibold mb-1 truncate">
            {user?.firstName
              ? `Welcome back, ${user.firstName}`
              : "Your Dashboard"}
          </h1>
          <p className="text-muted-foreground text-sm italic truncate">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setGoalInput(String(dailyGoal));
              setReminderEnabled(dashboard.settings?.reminderEnabled ?? false);
              setReminderTime(dashboard.settings?.reminderTime ?? "07:00");
              setShowSettings(!showSettings);
            }}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hidden sm:flex"
            onClick={() => void signOut()}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile sign-out button — always visible on small screens */}
      <div className="sm:hidden mb-6">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 w-full"
          onClick={() => void signOut()}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>

      {/* ═══ FEATURE 10: Milestone celebrations ═══ */}
      {dashboard.uncelebratedMilestones.length > 0 && (
        <div className="mb-6 space-y-2">
          {dashboard.uncelebratedMilestones.map((m) => (
            <Card
              key={m._id}
              className="border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-950/20"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-heading font-semibold text-sm">
                      Milestone Unlocked!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {MILESTONE_LABELS[m.type]?.(m.value) ??
                        `${m.type}: ${m.value}`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => { celebrateMilestone({ id: m._id }).catch(() => {}); }}
                >
                  <Sparkles className="h-3 w-3" />
                  Celebrate
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ═══ FEATURE 11: Reading reminder banner ═══ */}
      {dashboard.settings?.reminderEnabled && !hasReadToday && (
        <Card className="mb-6 border-blue-400/50 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Bell className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="font-heading font-semibold text-sm">
                Time to read!
              </p>
              <p className="text-xs text-muted-foreground">
                You haven&apos;t read any chapters today. Your daily goal is{" "}
                {dailyGoal} chapter{dailyGoal > 1 ? "s" : ""}.
              </p>
            </div>
            {dashboard.lastRead && (
              <Link
                href={`/bible/${dashboard.lastRead.bookSlug}/${dashboard.lastRead.chapter}`}
              >
                <Button size="sm" className="gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  Read Now
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══ Settings panel ═══ */}
      {showSettings && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Dashboard Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Daily Goal (chapters)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Reminder Time
                </label>
                <Input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  variant={reminderEnabled ? "default" : "outline"}
                  size="sm"
                  className="gap-1"
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                >
                  <Bell className="h-3.5 w-3.5" />
                  {reminderEnabled ? "Reminder On" : "Reminder Off"}
                </Button>
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => void handleSaveSettings()}>
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-heading font-bold">
              {dashboard.streak}
            </p>
            <p className="text-xs text-muted-foreground font-mono">Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-heading font-bold">
              {overallPercent}%
            </p>
            <p className="text-xs text-muted-foreground font-mono">Complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Bookmark className="h-4 w-4 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-heading font-bold">
              {dashboard.totalBookmarks}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Bookmarks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Highlighter className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-heading font-bold">
              {dashboard.totalHighlights}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Highlights
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-4 text-center">
            <PenLine className="h-4 w-4 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-heading font-bold">
              {dashboard.totalJournalEntries}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Journal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ═══ FEATURE 6: Daily Goal + FEATURE 7: VOTD ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Daily Goal Ring */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-primary" />
              Today&apos;s Goal
            </h2>
            <div className="flex justify-center">
              <DailyGoalRing
                current={dashboard.todayChapters}
                goal={dailyGoal}
              />
            </div>
          </CardContent>
        </Card>

        {/* Verse of the Day */}
        <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-primary" />
              Verse of the Day
            </h2>
            <blockquote className="text-sm leading-relaxed italic mb-3">
              &ldquo;{todayVerse.text}&rdquo;
            </blockquote>
            <div className="flex items-center justify-between">
              <Link
                href={`/bible/${todayVerse.book}/${todayVerse.chapter}#v${todayVerse.verse}`}
                className="text-xs text-primary font-mono font-semibold hover:underline"
              >
                {todayVerse.ref}
              </Link>
              <Link href="/verse-of-the-day">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  More
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue reading */}
      {dashboard.lastRead && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">
                  Continue Reading
                </p>
                <p className="font-heading font-semibold text-lg">
                  {bookName(dashboard.lastRead.bookSlug)}{" "}
                  {dashboard.lastRead.chapter}
                </p>
              </div>
              <Link
                href={`/bible/${dashboard.lastRead.bookSlug}/${dashboard.lastRead.chapter}`}
              >
                <Button className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ FEATURE 2: Reading History ═══ */}
      {dashboard.recentHistory.length > 1 && (
        <div className="mb-8">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Reading
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {dashboard.recentHistory.map((h) => (
              <Link
                key={h._id}
                href={`/bible/${h.bookSlug}/${h.chapter}`}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 text-center">
                    <p className="font-heading font-semibold text-sm">
                      {bookName(h.bookSlug)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Chapter {h.chapter}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active reading plans */}
      {activePlans.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              Active Plans
            </h2>
            <Link href="/plans">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                All Plans
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePlans.map((plan) => {
              const info = PLAN_INFO[plan.planSlug];
              if (!info) return null;
              const progress = Math.round(
                (plan.currentDay / info.days) * 100
              );
              const todayReading = getTodayReading(
                plan.planSlug,
                plan.currentDay
              );
              const readingLink = todayReading?.chapters[0]
                ? `/bible/${todayReading.chapters[0].bookSlug}/${todayReading.chapters[0].chapter}`
                : "/bible";

              return (
                <Card key={plan._id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-heading font-semibold text-sm">
                        {info.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-xs font-mono"
                      >
                        Day {plan.currentDay}/{info.days}
                      </Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {todayReading && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Today:{" "}
                        <span className="text-foreground font-medium">
                          {todayReading.label}
                        </span>
                      </p>
                    )}
                    <Link href={readingLink}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 w-full"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Continue Reading
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ FEATURE 3: Reading streak calendar ═══ */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="font-heading font-semibold text-sm flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-green-600" />
            Reading Activity
          </h2>
          <StreakCalendar calendarData={dashboard.calendarData} />
        </CardContent>
      </Card>

      {/* ═══ FEATURE 8: Book progress cards ═══ */}
      {booksWithProgress.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Book Progress
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {booksWithProgress.map((bp) => (
              <Link key={bp.slug} href={`/bible/${bp.slug}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <p className="font-heading font-semibold text-xs mb-1 truncate">
                      {bp.name}
                    </p>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${bp.percent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {bp.read}/{bp.total} · {bp.percent}%
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ FEATURES 1 & 9: Journal + Prayer Journal ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Feature 1: Recent Journal */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
              <PenLine className="h-5 w-5 text-purple-500" />
              Journal
            </h2>
            <Link href="/journal">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {dashboard.recentJournal.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <PenLine className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground italic">
                  No journal entries yet
                </p>
                <Link href="/journal" className="mt-2 inline-block">
                  <Button variant="outline" size="sm" className="gap-1">
                    Start Writing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {dashboard.recentJournal.map((entry) => (
                <Card key={entry._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-heading font-semibold text-sm truncate">
                        {entry.title}
                      </h3>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                        {new Date(entry._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.passage && (
                      <p className="text-[10px] text-primary font-mono mb-1">
                        {entry.passage}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {entry.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Feature 9: Prayer Journal */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-rose-500" />
              Prayers
            </h2>
            <Link href="/prayers">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {dashboard.recentPrayers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <HandHeart className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground italic">
                  No prayers yet
                </p>
                <Link href="/prayers" className="mt-2 inline-block">
                  <Button variant="outline" size="sm" className="gap-1">
                    Add Prayer
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {dashboard.recentPrayers.map((prayer) => (
                <Card
                  key={prayer._id}
                  className={prayer.answered ? "opacity-75" : ""}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {prayer.category}
                      </Badge>
                      {prayer.answered && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px]">
                          Answered
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs line-clamp-2">{prayer.request}</p>
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{dashboard.activePrayers} active</span>
                <span className="text-green-600">
                  {dashboard.answeredPrayers} answered
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ FEATURES 4 & 5: Bookmarks w/ Collections + Highlights w/ Notes ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Feature 4: Bookmarks with collections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-blue-500" />
              Bookmarks
            </h2>
            <Link href="/bookmarks">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {/* Collection summary */}
          {Object.keys(dashboard.collectionCounts).length > 1 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {Object.entries(dashboard.collectionCounts).map(
                ([col, count]) => (
                  <Badge
                    key={col}
                    variant="outline"
                    className="text-[10px] gap-1"
                  >
                    <FolderOpen className="h-2.5 w-2.5" />
                    {col} ({count})
                  </Badge>
                )
              )}
            </div>
          )}
          {dashboard.bookmarks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground italic">
                  No bookmarks yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {dashboard.bookmarks.map((bm) => (
                <Card key={bm._id}>
                  <CardContent className="p-4">
                    <Link
                      href={`/bible/${bm.bookSlug}/${bm.chapter}#v${bm.verseNumber}`}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-primary font-mono font-semibold">
                          {bm.reference}
                        </p>
                        {bm.collection && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] gap-0.5"
                          >
                            <FolderOpen className="h-2 w-2" />
                            {bm.collection}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed line-clamp-2">
                        {bm.text}
                      </p>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Feature 5: Highlights with notes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
              <Highlighter className="h-5 w-5 text-yellow-500" />
              Highlights
            </h2>
          </div>
          {dashboard.highlights.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Highlighter className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground italic">
                  No highlights yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {dashboard.highlights.map((hl) => (
                <Card key={hl._id}>
                  <CardContent className="p-4">
                    <Link
                      href={`/bible/${hl.bookSlug}/${hl.chapter}#v${hl.verseNumber}`}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: hl.color }}
                          aria-label={highlightColorName(hl.color)}
                        />
                        <p className="text-xs text-primary font-mono font-semibold">
                          {hl.bookName} {hl.chapter}:{hl.verseNumber}
                        </p>
                      </div>
                      {hl.text && (
                        <p
                          className="text-sm leading-relaxed line-clamp-2 rounded px-1 -mx-1"
                          style={{ backgroundColor: hl.color + "20" }}
                        >
                          {hl.text}
                        </p>
                      )}
                      {hl.note && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                          <MessageSquare className="h-3 w-3 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{hl.note}</span>
                        </p>
                      )}
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overall progress bar */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Bible Progress</span>
            <span className="text-muted-foreground font-mono">
              {dashboard.chaptersRead} / {dashboard.totalBibleChapters} chapters
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* ═══ FEATURE 12: Share / Accountability ═══ */}
      <Card className="mb-8 bg-linear-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <h2 className="font-heading font-semibold text-sm flex items-center gap-2 mb-3">
            <Share2 className="h-4 w-4 text-primary" />
            Share Your Progress
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Share your reading journey with friends and accountability partners.
          </p>
          <div className="bg-background rounded-lg p-4 mb-4 border">
            <p className="text-sm font-medium">{shareText}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              try {
                void navigator.clipboard.writeText(
                  `${shareText}\n\nRead along with me at https://www.divineword.app`
                );
              } catch {
                // Clipboard API not available
              }
            }}
          >
            <Share2 className="h-3.5 w-3.5" />
            Copy to Share
          </Button>
        </CardContent>
      </Card>

      {/* ═══ FEATURE 10 continued: Recent milestones ═══ */}
      {dashboard.milestones.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {dashboard.milestones.map((m) => (
              <Card
                key={m._id}
                className={
                  m.celebratedAt
                    ? ""
                    : "border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-950/20"
                }
              >
                <CardContent className="p-3 text-center">
                  <Trophy
                    className={`h-4 w-4 mx-auto mb-1 ${
                      m.celebratedAt
                        ? "text-muted-foreground"
                        : "text-yellow-500"
                    }`}
                  />
                  <p className="text-xs font-medium">
                    {MILESTONE_LABELS[m.type]?.(m.value) ??
                      `${m.type}: ${m.value}`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        <Link href="/bookmarks">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Bookmark className="h-5 w-5 mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium">Bookmarks</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/journal">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <PenLine className="h-5 w-5 mx-auto mb-2 text-purple-500" />
              <p className="text-sm font-medium">Journal</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/prayers">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <HandHeart className="h-5 w-5 mx-auto mb-2 text-rose-500" />
              <p className="text-sm font-medium">Prayers</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/stats">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-5 w-5 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Statistics</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/plans">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Plans</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ═══ Account & Profile Section ═══ */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Account
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setShowProfile(!showProfile);
                setFirstName(user?.firstName ?? "");
                setLastName(user?.lastName ?? "");
                setEditingName(false);
                setShowDeleteConfirm(false);
              }}
            >
              {showProfile ? "Close" : "Manage"}
            </Button>
          </div>

          {/* Account summary */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-lg">
              {user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-medium text-sm">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          {showProfile && (
            <div className="mt-6 space-y-6 border-t pt-6">
              {/* Name editing */}
              <div>
                <h3 className="text-sm font-medium mb-3">Display Name</h3>
                {editingName ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">First Name</label>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="h-9"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Last Name</label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-9"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingName(false)}
                        disabled={savingName}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={savingName}
                        onClick={async () => {
                          setSavingName(true);
                          try {
                            await user?.update({
                              firstName: firstName.trim(),
                              lastName: lastName.trim(),
                            });
                            setEditingName(false);
                          } catch {
                            // silently handle
                          } finally {
                            setSavingName(false);
                          }
                        }}
                      >
                        {savingName ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : null}
                        Save Name
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFirstName(user?.firstName ?? "");
                        setLastName(user?.lastName ?? "");
                        setEditingName(true);
                      }}
                    >
                      Edit Name
                    </Button>
                  </div>
                )}
              </div>

              {/* Account deletion */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2 text-red-600 dark:text-red-400">
                  Danger Zone
                </h3>
                {!showDeleteConfirm ? (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete Account
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 p-4 space-y-3">
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                      This action cannot be undone. All your reading progress, bookmarks, highlights, journal entries, and prayer requests will be permanently deleted.
                    </p>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        Type &quot;DELETE&quot; to confirm
                      </label>
                      <Input
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        placeholder="DELETE"
                        className="h-9 max-w-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteInput("");
                        }}
                        disabled={deleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleteInput !== "DELETE" || deleting}
                        onClick={async () => {
                          setDeleting(true);
                          try {
                            await user?.delete();
                            router.push("/");
                          } catch {
                            setDeleting(false);
                          }
                        }}
                      >
                        {deleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                        )}
                        Permanently Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Donate Section ═══ */}
      <Card className="mb-8 bg-linear-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/30">
        <CardContent className="p-6 text-center">
          <Heart className="h-6 w-6 text-rose-500 mx-auto mb-3" />
          <h2 className="font-heading font-semibold text-lg mb-2">
            Support Divine Word
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Divine Word is free to use. If this app has blessed your walk with God,
            consider supporting its continued development and server costs.
          </p>
          <Link href="/support">
            <Button className="gap-2">
              <Heart className="h-4 w-4" />
              Buy Me a Coffee
            </Button>
          </Link>
          <p className="text-[10px] text-muted-foreground mt-3 italic">
            &ldquo;Each of you should give what you have decided in your heart to give&rdquo; — 2 Corinthians 9:7
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
