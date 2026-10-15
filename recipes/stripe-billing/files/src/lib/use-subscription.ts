"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export type SubscriptionState = {
  /** Still resolving auth or the first query. Render a skeleton, not the paywall. */
  isLoading: boolean;
  isActive: boolean;
  status: string;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  hasCustomer: boolean;
};

/**
 * Realtime subscription state for the signed-in user. Flips to `isActive`
 * the moment the webhook lands — no polling, no "refresh to see your plan".
 */
export function useSubscription(): SubscriptionState {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const sub = useQuery(api.subscriptions.getMine, isAuthenticated ? {} : "skip");

  if (authLoading || (isAuthenticated && sub === undefined)) {
    return { isLoading: true, isActive: false, status: "loading", currentPeriodEnd: null, cancelAtPeriodEnd: false, hasCustomer: false };
  }
  if (!sub) {
    return { isLoading: false, isActive: false, status: "none", currentPeriodEnd: null, cancelAtPeriodEnd: false, hasCustomer: false };
  }
  return { isLoading: false, ...sub };
}
