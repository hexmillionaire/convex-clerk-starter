"use client";

import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { Loader2, Lock } from "lucide-react";
import { useUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ConnectingState } from "@/components/connecting-state";
import { ItemsPanel } from "@/components/items-panel";
import { SettingsPanel } from "@/components/settings-panel";

/**
 * The auth gate every protected page uses. Three states, in order:
 *
 *   1. Clerk hasn't loaded      → quiet spinner
 *   2. Clerk says signed out    → sign-in prompt (no redirect; the URL stays
 *                                 shareable and the back button works)
 *   3. Clerk signed in, Convex  → ConnectingState, which escalates to a
 *      token not yet validated     "sign out and retry" only if it drags on
 *
 * Then the real page. Child components call Convex with `"skip"` until
 * `isAuthenticated` so no query ever runs as the wrong user.
 */
export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { isAuthenticated } = useConvexAuth();

  if (!isLoaded) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container max-w-md mx-auto px-4 py-20 text-center">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Sign in to see your items. This is the demo of per-user realtime data.
        </p>
        <Link href="/login">
          <Button className="gap-2">Sign in to continue</Button>
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl mx-auto px-4">
        <ConnectingState authPending className="text-center py-20" />
      </div>
    );
  }

  const name = user?.firstName ?? user?.username ?? "there";

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10 md:py-14">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1">
          Dashboard
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Hey, {name}.</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Everything below is yours alone and updates live. Open this page in a
          second tab to watch.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <ItemsPanel />
        <SettingsPanel />
      </div>
    </div>
  );
}
