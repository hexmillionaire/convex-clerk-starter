import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { BookOpen, Search } from "lucide-react";
import { socialMetadata } from "@/lib/metadata";

export const metadata: Metadata = socialMetadata({
  title: "About Divine Word — Free Online KJV Bible",
  description:
    "Divine Word is a free, ad-free online Bible: the complete King James Version with search, bookmarks, highlights, a journal, reading plans and offline reading.",
  canonical: "/about",
});

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-2xl px-6 py-16 md:py-20">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xl text-primary">✦</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          About Divine Word
        </h1>
      </div>

      <div className="space-y-6 text-base leading-[1.8] text-muted-foreground">
        <p>
          Divine Word is a free online Bible designed for focused, distraction-free
          scripture reading. Read the complete King James Version — all 66 books, 1,189
          chapters, and 31,102 verses — in a clean, quiet interface that puts
          God&apos;s Word first.
        </p>
        <p>
          Whether you&apos;re looking up a specific verse, studying a chapter in depth,
          or following a structured reading plan, Divine Word makes it easy to engage
          with scripture every day. Full-text search covers the entire Bible. Verses can
          be bookmarked, highlighted in six colours, and annotated with private notes.
          A personal journal keeps your reflections alongside the passages that prompted
          them, and guided plans run from 30-day devotionals to reading the Bible in a
          year.
        </p>
        <p>
          The whole King James Version ships with the site, so it can be downloaded for
          reading with no connection at all — on a plane, in a basement, or anywhere the
          signal goes. Three themes, including sepia, and adjustable text size make long
          reading comfortable.
        </p>
        <p>
          The King James Version is in the public domain and remains one of the most
          widely read English translations of the Bible. Divine Word is built with love
          for the glory of God and is free for everyone — no ads, no distractions, just
          the Word.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-3 border-t pt-10">
        <Link href="/bible">
          <Button className="h-11 gap-2 px-5">
            <BookOpen className="h-4 w-4" />
            Start reading
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" className="h-11 gap-2 px-5">
            <Search className="h-4 w-4" />
            Search scripture
          </Button>
        </Link>
      </div>
    </div>
  );
}
