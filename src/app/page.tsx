import type { Metadata } from "next";
import { getVerseOfTheDay, getTomorrowVerse } from "@/lib/daily-verses";
import { VotdCard } from "@/components/votd-card";
import { ContinueReadingCard } from "@/components/continue-reading-card";
import { ProgressSummary } from "@/components/progress-summary";
import { ActivePlanCard } from "@/components/active-plan-card";
import { RetentionWidgets } from "@/components/retention-widgets";
import { Greeting } from "@/components/greeting";
import { TomorrowPreview } from "@/components/tomorrow-preview";
import { WeeklyRecap } from "@/components/weekly-recap";
import { SafeSection } from "@/components/safe-section";

export const metadata: Metadata = {
  title: "Divine Word — Free Online Bible (KJV)",
  description:
    "Free, beautiful, distraction-free Bible. Read the King James Version online. Verse of the Day, reading plans, and scripture search.",
  openGraph: {
    title: "Divine Word — Free Online Bible (KJV)",
    description:
      "Read the King James Version online for free. Beautiful, distraction-free Bible with reading plans, search, and study tools.",
    type: "website",
  },
  alternates: {
    canonical: "https://www.divineword.app",
  },
};

export default function HomePage() {
  const votd = getVerseOfTheDay();
  const tomorrowVerse = getTomorrowVerse();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Divine Word",
    url: "https://www.divineword.app",
    description: "Free, beautiful, distraction-free Bible. Read the King James Version online.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.divineword.app/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-[80vh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="stagger-children">
        {/* Personal greeting — emotional hook */}
        <Greeting />

        {/* Verse of the Day — daily inspiration */}
        <VotdCard verse={votd} />

        {/* Retention: streak banner, daily goal, onboarding CTA, milestones */}
        <SafeSection><RetentionWidgets /></SafeSection>

        {/* Continue Reading / Where to Start — clear action */}
        <SafeSection><ContinueReadingCard /></SafeSection>

        {/* Progress Summary (signed-in only) — satisfaction */}
        <SafeSection><ProgressSummary /></SafeSection>

        {/* Weekly Recap — reflection */}
        <SafeSection><WeeklyRecap /></SafeSection>

        {/* Active Reading Plan */}
        <SafeSection><ActivePlanCard /></SafeSection>

        {/* Tomorrow's verse preview — anticipation hook */}
        <TomorrowPreview verse={tomorrowVerse} />
      </div>

      {/* About / SEO Content */}
      <section className="py-16 md:py-24">
        <div className="container max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-heading font-semibold tracking-tight">
              About Divine Word
            </h2>
          </div>
          <div className="prose prose-neutral dark:prose-invert mx-auto text-base leading-[1.8] space-y-6 text-muted-foreground">
            <p>
              Divine Word is a free online Bible designed for focused, distraction-free
              scripture reading. Read the complete King James Version (KJV) — all 66 books,
              1,189 chapters, and 31,102 verses — in a clean, beautiful interface that puts
              God&apos;s Word first.
            </p>
            <p>
              Whether you&apos;re looking up a specific verse, studying a chapter in depth,
              or following a structured reading plan, Divine Word makes it easy to engage with
              scripture every day. Features include full-text search across the entire Bible,
              verse bookmarking, text highlighting, a personal journal, and guided reading
              plans from 30-day devotionals to reading the Bible in a year.
            </p>
            <p>
              The King James Version is in the public domain and remains one of the most
              widely read English translations of the Bible. Divine Word is built with love
              for the glory of God and is free for everyone — no ads, no distractions, just
              the Word.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
