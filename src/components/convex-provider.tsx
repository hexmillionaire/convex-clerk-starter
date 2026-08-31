"use client";

import { ConvexReactClient, ConvexProviderWithAuth } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth, useUser as useClerkUser, useClerk as useClerkClerk } from "@clerk/nextjs";
import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  AuthContext,
  AnonymousAuthProvider,
  hasClerkSessionCookie,
  routeNeedsAuth,
} from "@/lib/auth";

/**
 * This provider must render on the server.
 *
 * It previously wrapped the whole app in `dynamic(..., { ssr: false })`, which
 * meant nothing beneath it — navbar, main, footer, and every page's server
 * components — reached the HTML. Pages shipped an empty <body> with all their
 * content stranded in the flight payload, invisible to any crawler that
 * doesn't execute JavaScript.
 *
 * It also decides whether Clerk loads at all: see src/lib/auth.tsx.
 */

// One client for the process, so moving between the Clerk and anonymous trees
// (which happens on the first navigation into an auth route) doesn't open a
// second connection.
let clientSingleton: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient {
  if (clientSingleton) return clientSingleton;
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not set. Add it to your Vercel environment variables."
    );
  }
  clientSingleton = new ConvexReactClient(url);
  return clientSingleton;
}

function useConvexClient() {
  return useMemo(() => getConvexClient(), []);
}

/** Publishes Clerk's values into the app's own auth context. */
function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, user } = useClerkUser();
  const { signOut } = useClerkClerk();

  const value = useMemo(
    () => ({ isSignedIn: !!isSignedIn, isLoaded, user: user ?? null, signOut }),
    [isSignedIn, isLoaded, user, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** The tree as it was before Clerk became conditional. */
function WithClerk({ children }: { children: ReactNode }) {
  const convex = useConvexClient();
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ClerkAuthBridge>{children}</ClerkAuthBridge>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

const FETCH_NO_TOKEN = async () => null;

/**
 * A settled "signed out" for Convex.
 *
 * This has to be `ConvexProviderWithAuth` rather than a plain `ConvexProvider`:
 * `useConvexAuth()` throws outright without an auth context, and the chapter
 * reader — the most-visited public page — calls it.
 */
function useAnonymousAuth() {
  return useMemo(
    () => ({ isLoading: false, isAuthenticated: false, fetchAccessToken: FETCH_NO_TOKEN }),
    []
  );
}

/** No Clerk script, no session; Convex serves public data only. */
function WithoutClerk({ children }: { children: ReactNode }) {
  const convex = useConvexClient();
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAnonymousAuth}>
      <AnonymousAuthProvider>{children}</AnonymousAuthProvider>
    </ConvexProviderWithAuth>
  );
}

const subscribeToNothing = () => () => {};

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Read the cookie without a mount effect. The server snapshot is `false`, so
  // the prerendered HTML is always the anonymous tree — which is right: static
  // pages are shared between all readers and must not assume a session.
  const hasSession = useSyncExternalStore(
    subscribeToNothing,
    hasClerkSessionCookie,
    () => false
  );

  const needsClerk = routeNeedsAuth(pathname) || hasSession;

  return needsClerk ? <WithClerk>{children}</WithClerk> : <WithoutClerk>{children}</WithoutClerk>;
}
