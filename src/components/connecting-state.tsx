"use client";

import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClerk } from "@/lib/auth";

type Props = {
  /**
   * True when Clerk reports the user is signed in but the Convex auth token
   * hasn't resolved yet (the common cause of a "stuck" spinner). When true and
   * the wait runs long, we surface a retry affordance.
   */
  authPending?: boolean;
  /** Wrapper classes — defaults to a centred block with vertical padding. */
  className?: string;
  /** Delay (ms) before showing the "still connecting" hint + retry button. */
  hintDelayMs?: number;
};

/**
 * Shared loading state for auth-gated pages. Shows a quiet spinner while data
 * (or the auth token) is resolving, and only escalates to a reconnect hint if
 * the auth handshake is genuinely taking too long — so a normal 1–2s wait never
 * looks broken.
 */
export function ConnectingState({
  authPending = false,
  className = "text-center py-16",
  hintDelayMs = 6000,
}: Props) {
  const { signOut } = useClerk();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Only arm the "taking too long" hint while auth is genuinely pending.
    // (The render below gates on `authPending`, so no synchronous reset is needed.)
    if (!authPending) return;
    const t = setTimeout(() => setShowHint(true), hintDelayMs);
    return () => clearTimeout(t);
  }, [authPending, hintDelayMs]);

  return (
    <div className={className}>
      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
      {authPending && showHint && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">
            Still connecting to your account…
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            If this doesn&apos;t clear in a moment, try signing out and back in.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => signOut({ redirectUrl: "/login" })}
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign Out &amp; Retry
          </Button>
        </div>
      )}
    </div>
  );
}
