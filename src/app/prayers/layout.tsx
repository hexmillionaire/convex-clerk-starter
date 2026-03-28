import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prayer Journal — Divine Word",
  description: "Keep track of your prayer requests, praises, and answered prayers in your private prayer journal.",
  alternates: { canonical: "https://www.divineword.app/prayers" },
};

export default function PrayersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
