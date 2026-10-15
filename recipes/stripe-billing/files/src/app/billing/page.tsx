"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAction } from "convex/react";
import { Check, CreditCard, Loader2, Lock, Sparkles } from "lucide-react";
import { api } from "@convex/_generated/api";
import { useUser } from "@/lib/auth";
import { useSubscription } from "@/lib/use-subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Paywall } from "@/components/paywall";

const FEATURES = ["Everything in Free", "The paid thing your app does", "Priority support"];

/**
 * `useSearchParams` needs a Suspense boundary above it or Next refuses to
 * prerender the route. The boundary is the whole page; the fallback is the
 * same spinner the auth gate shows.
 */
export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-3xl mx-auto px-4 py-20 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        </div>
      }
    >
      <BillingInner />
    </Suspense>
  );
}

function BillingInner() {
  const { isLoaded, isSignedIn } = useUser();
  const sub = useSubscription();
  const params = useSearchParams();
  const checkout = params.get("checkout");

  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const createPortal = useAction(api.stripe.createPortalSession);
  const [busy, setBusy] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(kind: "checkout" | "portal") {
    setBusy(kind);
    setError(null);
    try {
      const { url } = kind === "checkout" ? await createCheckout() : await createPortal();
      window.location.assign(url);
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  if (!isLoaded) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container max-w-md mx-auto px-4 py-20 text-center">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Billing</h1>
        <p className="text-muted-foreground text-sm mb-6">Sign in to manage your plan.</p>
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  const renews = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : null;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10 md:py-14">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1">Billing</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Your plan</h1>
      </header>

      {checkout === "success" && !sub.isActive && !sub.isLoading && (
        <p className="mb-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
          Payment received. Activating your plan — this updates live as soon as Stripe confirms, usually within a few seconds.
        </p>
      )}
      {checkout === "cancelled" && (
        <p className="mb-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Checkout cancelled. Nothing was charged.
        </p>
      )}
      {error && (
        <p className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Current plan</CardTitle>
            {sub.isLoading ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <Badge variant={sub.isActive ? "default" : "secondary"}>{sub.isActive ? "Pro" : "Free"}</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {sub.isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : sub.isActive ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {sub.cancelAtPeriodEnd ? "Cancels" : "Renews"} {renews ?? "soon"}.
                  {sub.status === "trialing" && " You're on a trial."}
                </p>
                <Button variant="outline" className="w-full gap-2" onClick={() => void go("portal")} disabled={busy !== null}>
                  {busy === "portal" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  Manage billing
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {sub.status === "past_due"
                    ? "Your last payment failed. Update your card to restore access."
                    : "You're on the free plan."}
                </p>
                {sub.hasCustomer && (
                  <Button variant="outline" className="w-full gap-2" onClick={() => void go("portal")} disabled={busy !== null}>
                    <CreditCard className="h-4 w-4" />
                    Billing history
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className={sub.isActive ? "opacity-60" : "border-primary/40"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Pro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button className="w-full gap-2" onClick={() => void go("checkout")} disabled={busy !== null || sub.isActive || sub.isLoading}>
              {busy === "checkout" && <Loader2 className="h-4 w-4 animate-spin" />}
              {sub.isActive ? "You're on Pro" : "Upgrade"}
            </Button>
            <p className="text-[11px] text-muted-foreground">Secure checkout by Stripe. Cancel anytime.</p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-3">Paywall demo</p>
        <Paywall>
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-6 text-sm">
            You can see this because your subscription is active. Wrap anything in <code className="font-mono">&lt;Paywall&gt;</code> to gate it.
          </div>
        </Paywall>
      </section>
    </div>
  );
}
