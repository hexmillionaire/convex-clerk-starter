"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ReactNode, useMemo } from "react";
import dynamic from "next/dynamic";

function ConvexClientProviderInner({ children }: { children: ReactNode }) {
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

export const ConvexClientProvider = dynamic(
  () => Promise.resolve(ConvexClientProviderInner),
  {
    ssr: false,
    loading: () => null,
  }
);
