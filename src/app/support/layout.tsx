import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support — Divine Word",
  description:
    "Support Divine Word's continued development and server costs.",
  alternates: {
    canonical: "https://www.divineword.app/support",
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
