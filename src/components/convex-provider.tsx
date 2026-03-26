"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
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
    <ConvexAuthProvider client={client}>
      {children}
    </ConvexAuthProvider>
  );
}

export const ConvexClientProvider = dynamic(
  () => Promise.resolve(ConvexClientProviderInner),
  {
    ssr: false,
    loading: () => null,
  }
);
