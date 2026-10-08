import type { Metadata } from "next";
import { socialMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = socialMetadata({
  title: `Dashboard — ${SITE_NAME}`,
  description: "Your items and settings, synced in realtime.",
  canonical: "/dashboard",
  noIndex: true,
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
