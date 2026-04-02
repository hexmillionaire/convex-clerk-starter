import { type DailyVerse } from "@/lib/daily-verses";

type Props = {
  verse: DailyVerse;
};

/**
 * Blurred preview of tomorrow's verse to create anticipation.
 * Placed at the bottom of the homepage to drive return visits.
 */
export function TomorrowPreview({ verse }: Props) {
  return (
    <section className="py-4">
      <div className="container max-w-2xl mx-auto px-6">
        <div className="rounded-2xl border bg-card/50 p-6 relative overflow-hidden">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/70 mb-3">
            Tomorrow&apos;s Verse
          </p>

          <div className="relative">
            {/* Blurred verse text — creates curiosity */}
            <p className="text-lg font-serif text-muted-foreground/60 blur-[6px] select-none leading-relaxed line-clamp-2 pointer-events-none">
              {verse.text}
            </p>

            {/* Overlay message */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm font-heading font-semibold text-foreground/70 tracking-wide">
                Come back tomorrow to reveal ✦
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground/40 mt-3 font-mono">
            — {verse.ref}
          </p>
        </div>
      </div>
    </section>
  );
}
