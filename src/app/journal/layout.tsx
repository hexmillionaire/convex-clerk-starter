import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal — Divine Word",
  description: "Your personal Bible study journal. Record reflections, prayers, and notes on scripture.",
  alternates: { canonical: "https://www.divineword.app/journal" },
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
