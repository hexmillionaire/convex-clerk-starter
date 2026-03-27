import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reading Plans — Divine Word",
  description: "Bible reading plans to guide your scripture study. 30-day, 90-day, and yearly plans for the King James Version.",
  alternates: { canonical: "https://www.divineword.app/plans" },
};

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return children;
}
