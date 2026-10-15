"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useSubscription } from "@/lib/use-subscription";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Renders children only for active subscribers. Everyone else sees the
 * fallback, which defaults to an upgrade prompt.
 *
 *   <Paywall>
 *     <ExportButton />
 *   </Paywall>
 *
 * This is a UI gate. Anything that must be enforced goes in the Convex
 * function too — check `subscriptions` there before doing the paid thing.
 */
export function Paywall({
  children,
  fallback,
  title = "This is a Pro feature",
}: {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
}) {
  const sub = useSubscription();

  if (sub.isLoading) return <Skeleton className="h-24 w-full" />;
  if (sub.isActive) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;

  return (
    <div className="rounded-lg border border-dashed border-border p-6 text-center">
      <Lock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">Upgrade to unlock it.</p>
      <Link href="/billing" className="mt-4 inline-block">
        <Button size="sm">See plans</Button>
      </Link>
    </div>
  );
}
