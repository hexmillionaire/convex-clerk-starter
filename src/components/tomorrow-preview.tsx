/**
 * Teases that there is a verse tomorrow, without shipping it.
 * Placed at the bottom of the homepage to drive return visits.
 */
export function TomorrowPreview() {
  return (
    <section className="py-4">
      <div className="container max-w-2xl mx-auto px-6">
        <div className="rounded-2xl border bg-card/50 p-6 relative overflow-hidden">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/70 mb-3">
            Tomorrow&apos;s Verse
          </p>

          <div className="relative">
            {/*
              Decorative only. The verse used to be real text behind a CSS
              blur, which meant screen readers announced tomorrow's verse in
              full and anyone could read it from the DOM. This is a blurred
              stand-in with the same shape, hidden from assistive tech; the
              message below is what actually gets announced.
            */}
            <p
              aria-hidden="true"
              className="pointer-events-none font-serif text-lg leading-relaxed text-muted-foreground/60 blur-[6px] select-none"
            >
              {"\u2014".repeat(38)}
            </p>

            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-heading text-sm font-semibold tracking-wide text-foreground/70">
                Come back tomorrow to reveal ✦
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
