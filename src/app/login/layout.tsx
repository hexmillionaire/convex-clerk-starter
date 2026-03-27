import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Divine Word",
  description: "Sign in to Divine Word to save bookmarks, highlights, journal entries, and track your reading progress.",
  alternates: { canonical: "https://www.divineword.app/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
