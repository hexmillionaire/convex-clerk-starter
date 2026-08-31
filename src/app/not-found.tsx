import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Home } from "lucide-react";
import { getVerseOfTheDay } from "@/lib/daily-verses";

export const metadata: Metadata = {
  title: "Page Not Found — Divine Word",
  robots: { index: false, follow: true },
};

/**
 * There was no not-found.tsx, so a missing page rendered the stock black
 * Next.js screen inside the site's chrome, with no way back to reading.
 */
export default function NotFound() {
  const verse = getVerseOfTheDay();

  return (
    <div className="container mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
      <p className="mb-3 text-2xl text-primary">✦</p>

      <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The link may be broken, or the chapter or verse may not exist. Everything
        else is still here.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/bible">
          <Button className="h-11 gap-2 px-5">
            <BookOpen className="h-4 w-4" />
            Browse the Bible
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" className="h-11 gap-2 px-5">
            <Search className="h-4 w-4" />
            Search scripture
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="h-11 gap-2 px-5">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
      </div>

      <div className="mt-14 w-full border-t pt-8">
        <p className="mb-3 font-mono text-[0.625rem] tracking-[0.14em] text-muted-foreground uppercase">
          While you&apos;re here
        </p>
        <blockquote className="font-serif text-lg leading-relaxed italic text-foreground/85">
          &ldquo;{verse.text}&rdquo;
        </blockquote>
        <Link
          href={`/bible/${verse.book}/${verse.chapter}#v${verse.verse}`}
          className="mt-3 inline-block font-mono text-xs font-semibold text-primary hover:underline"
        >
          {verse.ref}
        </Link>
      </div>
    </div>
  );
}
