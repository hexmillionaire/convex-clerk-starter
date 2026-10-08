import type { Metadata } from "next";
import { socialMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = socialMetadata({
  title: `Sign in — ${SITE_NAME}`,
  description: `Sign in to ${SITE_NAME}.`,
  canonical: "/login",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
