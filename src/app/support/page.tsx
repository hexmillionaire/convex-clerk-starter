"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";

export default function SupportPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  function renderPayPalButton() {
    const el = containerRef.current;
    if (!el || el.childElementCount > 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paypal = (window as any).paypal;
    if (!paypal?.HostedButtons) return;
    paypal
      .HostedButtons({ hostedButtonId: "7JTQ77G4685D6" })
      .render("#paypal-container-7JTQ77G4685D6");
  }

  useEffect(() => {
    // If the SDK loaded before this component mounted
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).paypal?.HostedButtons) {
      renderPayPalButton();
    }
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full bg-linear-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/30">
        <CardContent className="p-8 text-center">
          <Heart className="h-8 w-8 text-rose-500 mx-auto mb-4" />
          <h1 className="font-heading font-semibold text-2xl mb-3">
            Support Divine Word
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Divine Word is free to use. If this app has blessed your walk with
            God, consider supporting its continued development and server costs.
          </p>

          {/* PayPal SDK */}
          <Script
            src="https://www.paypal.com/sdk/js?client-id=BAAZmZ-7sUmqKeOwPxC28QC1e6d3ptmzwQJ7_6gb63W7LvTO9jC6spIFsZEd9dbiXtgtS4egzf_H_wZsnU&components=hosted-buttons&disable-funding=venmo&currency=USD"
            strategy="afterInteractive"
            onLoad={renderPayPalButton}
          />

          {/* PayPal button renders here */}
          <div
            id="paypal-container-7JTQ77G4685D6"
            ref={containerRef}
            className="min-h-12 mb-4"
          />

          <p className="text-[10px] text-muted-foreground mt-4 italic">
            &ldquo;Each of you should give what you have decided in your heart
            to give&rdquo; — 2 Corinthians 9:7
          </p>

          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mt-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
