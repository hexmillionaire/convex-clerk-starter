import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Divine Word",
  description:
    "Your personal Bible reading dashboard. View bookmarks, highlights, reading progress, and plans.",
  alternates: {
    canonical: "https://www.divineword.app/dashboard",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
