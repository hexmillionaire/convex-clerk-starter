import type { Metadata } from "next";
import { socialMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = socialMetadata({
  title: `Billing — ${SITE_NAME}`,
  description: "Manage your plan.",
  canonical: "/billing",
  noIndex: true,
});

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
