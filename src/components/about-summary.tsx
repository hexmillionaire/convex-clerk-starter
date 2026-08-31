"use client";

import Link from "next/link";
import { useUser } from "@/lib/auth";

/**
 * Landing-page copy appended to an application reads oddly to someone who
 * already uses it — and on a phone it was a long scroll past the tools they
 * came for. First-time visitors still get the full pitch; returning readers
 * get two sentences and a link.
 *
 * The complete text lives at /about, which is where it can be indexed on its
 * own terms.
 */
export function AboutSummary() {
  const { isSignedIn, isLoaded } = useUser();

  // Until auth settles, show the short version: it's the safe default for a
  // statically rendered page shared between signed-in and signed-out readers.
  const brief = !isLoaded || isSignedIn;

  return (
    <section className="py-14 md:py-20">
      <div className="container max-w-2xl mx-auto px-6">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            About Divine Word
          </h2>
        </div>

        <div className="mx-auto space-y-6 text-base leading-[1.8] text-muted-foreground">
          <p>
            Divine Word is a free online Bible for focused, distraction-free reading —
            the complete King James Version, all 66 books, 1,189 chapters and 31,102
            verses, with search, bookmarks, highlights, a journal and reading plans.
          </p>

          {!brief && (
            <>
              <p>
                Whether you&apos;re looking up a specific verse, studying a chapter in
                depth, or following a structured reading plan, Divine Word makes it easy
                to engage with scripture every day. Features include full-text search
                across the entire Bible, verse bookmarking, text highlighting, a personal
                journal, and guided reading plans from 30-day devotionals to reading the
                Bible in a year.
              </p>
              <p>
                The King James Version is in the public domain and remains one of the most
                widely read English translations of the Bible. Divine Word is built with
                love for the glory of God and is free for everyone — no ads, no
                distractions, just the Word.
              </p>
            </>
          )}

          <p>
            <Link href="/about" className="text-primary hover:underline">
              Learn more about Divine Word
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
