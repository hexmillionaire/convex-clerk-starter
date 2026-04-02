"use client";

import Link from "next/link";
import { BookOpen, Flame, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const VALUE_PROPS = [
  { icon: Flame, text: "Build a daily reading streak" },
  { icon: Target, text: "Set goals & track progress" },
  { icon: BookOpen, text: "Guided reading plans" },
];

/**
 * Warm, low-friction sign-up CTA for unauthenticated homepage visitors.
 * Inspired by Duolingo's "Get started" flow — emphasizes free + quick.
 */
export function OnboardingCta() {
  return (
    <section className="py-8">
      <div className="container max-w-2xl mx-auto px-6">
        <div className="rounded-2xl border border-primary/10 bg-linear-to-br from-primary/5 via-transparent to-primary/5 p-8 md:p-10 text-center">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary mb-4">
            Free &bull; No ads &bull; Takes 2 min
          </p>
          <h3 className="text-xl md:text-2xl font-heading font-bold mb-5 tracking-tight">
            Make Scripture a daily habit
          </h3>

          {/* Value props */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8">
            {VALUE_PROPS.map((vp) => {
              const Icon = vp.icon;
              return (
                <div key={vp.text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{vp.text}</span>
                </div>
              );
            })}
          </div>

          <Link href="/login">
            <Button size="lg" className="gap-2.5 text-base px-10 h-12 rounded-full w-full sm:w-auto">
              Start Reading — It&apos;s Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <p className="text-[10px] text-muted-foreground mt-4 font-mono tracking-wide">
            Join thousands reading scripture daily
          </p>
        </div>
      </div>
    </section>
  );
}
