import type { Metadata } from "next";
import { getVerseOfTheDay } from "@/lib/daily-verses";
import { VotdCard } from "@/components/votd-card";
import { ContinueReadingCard } from "@/components/continue-reading-card";
import { ProgressSummary } from "@/components/progress-summary";
import { ActivePlanCard } from "@/components/active-plan-card";
import { RetentionWidgets } from "@/components/retention-widgets";
import { Greeting } from "@/components/greeting";
import { TomorrowPreview } from "@/components/tomorrow-preview";
import { WeeklyRecap } from "@/components/weekly-recap";
import { SafeSection } from "@/components/safe-section";
import { AboutSummary } from "@/components/about-summary";
import { OfflineDownload } from "@/components/offline-download";
import { socialMetadata } from "@/lib/metadata";

export const revalidate = 86400;

export const metadata: Metadata = socialMetadata({
  title: "Divine Word — Free Online Bible (KJV)",
  description:
    "Free, beautiful, distraction-free Bible. Read the King James Version online. Verse of the Day, reading plans, and scripture search.",
  canonical: "/",
});

export default function HomePage() {
  const votd = getVerseOfTheDay();

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

        {/* The page's actual heading. Visually quiet so it doesn't compete
            with the greeting for returning readers, but it gives the page a
            real <h1> and tells a first-time visitor what this is. */}
        <section className="container max-w-2xl mx-auto px-6 pb-1">
          <h1 className="sr-only">
            Divine Word — read the King James Version Bible online, free
          </h1>
        </section>

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
        <TomorrowPreview />
      </div>

      <AboutSummary />

      {/* Offline is the reason to keep this on a home screen */}
      <section className="container max-w-2xl mx-auto px-6 pb-16">
        <OfflineDownload />
      </section>

    </div>
  );
}
