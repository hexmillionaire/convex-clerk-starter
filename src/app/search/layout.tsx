import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Scripture — Divine Word",
  description:
    "Search every word and phrase across the entire King James Bible instantly. Find verses by topic, keyword, or reference.",
  alternates: {
    canonical: "https://www.divineword.app/search",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
