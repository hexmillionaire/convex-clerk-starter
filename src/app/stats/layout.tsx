import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reading Statistics — Divine Word",
  description:
    "Track your Bible reading progress. See your streak, chapters read, bookmarks, highlights, and journal entries.",
  alternates: {
    canonical: "https://www.divineword.app/stats",
  },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
