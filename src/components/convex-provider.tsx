"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ReactNode, useMemo } from "react";

/**
 * This provider must render on the server.
 *
 * It previously wrapped the whole app in `dynamic(..., { ssr: false })`, which
 * meant nothing beneath it — navbar, main, footer, and every page's server
 * components — reached the HTML. Pages shipped an empty <body> with all their
 * content stranded in the flight payload, invisible to any crawler that doesn't
 * execute JavaScript.
 *
 * Convex and Clerk both render fine on the server; queries simply resolve on the
 * client after hydration. Components that need a signed-in user should render a
 * skeleton until `isAuthenticated`, which is what they already do.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error(
        "NEXT_PUBLIC_CONVEX_URL is not set. Add it to your Vercel environment variables."
      );
    }
    return new ConvexReactClient(url);
  }, []);

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk client={client} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
