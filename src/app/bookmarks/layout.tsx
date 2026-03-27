import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks — Divine Word",
  description: "Your saved Bible verses and bookmarks. Access your favorite scripture passages.",
  alternates: { canonical: "https://www.divineword.app/bookmarks" },
};

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
