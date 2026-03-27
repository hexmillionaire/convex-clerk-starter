import Link from "next/link";
import type { Metadata } from "next";
import { Book, Search, BookMarked, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OLD_TESTAMENT, NEW_TESTAMENT } from "@/lib/bible-data";

export const metadata: Metadata = {
  title: "Divine Word — Free Online Bible (KJV)",
  description:
    "Free, beautiful, distraction-free Bible. Read the King James Version online. Verse of the Day, reading plans, and scripture search.",
  openGraph: {
    title: "Divine Word — Free Online Bible (KJV)",
    description:
      "Read the King James Version online for free. Beautiful, distraction-free Bible with reading plans, search, and study tools.",
    type: "website",
  },
  alternates: {
    canonical: "https://www.divineword.app",
  },
};

const FEATURED_VERSES = [
  { ref: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", book: "john", chapter: 3, verse: 16 },
  { ref: "Psalm 23:1", text: "The LORD is my shepherd; I shall not want.", book: "psalms", chapter: 23, verse: 1 },
  { ref: "Proverbs 3:5-6", text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.", book: "proverbs", chapter: 3, verse: 5 },
  { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me.", book: "philippians", chapter: 4, verse: 13 },
  { ref: "Romans 8:28", text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", book: "romans", chapter: 8, verse: 28 },
  { ref: "Isaiah 41:10", text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.", book: "isaiah", chapter: 41, verse: 10 },
  { ref: "Jeremiah 29:11", text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.", book: "jeremiah", chapter: 29, verse: 11 },
  { ref: "Matthew 11:28", text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", book: "matthew", chapter: 11, verse: 28 },
  { ref: "Psalm 46:10", text: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.", book: "psalms", chapter: 46, verse: 10 },
  { ref: "Joshua 1:9", text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.", book: "joshua", chapter: 1, verse: 9 },
  { ref: "Psalm 119:105", text: "Thy word is a lamp unto my feet, and a light unto my path.", book: "psalms", chapter: 119, verse: 105 },
  { ref: "Romans 12:2", text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.", book: "romans", chapter: 12, verse: 2 },
];

function getVerseOfTheDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return FEATURED_VERSES[dayOfYear % FEATURED_VERSES.length];
}

export default function HomePage() {
  const votd = getVerseOfTheDay();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Divine Word",
    url: "https://www.divineword.app",
    description: "Free, beautiful, distraction-free Bible. Read the King James Version online.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.divineword.app/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-[80vh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent" />
        <div className="container max-w-4xl mx-auto px-4 text-center relative">
          <p className="text-primary text-2xl mb-4 tracking-[0.3em]">✦ ✦ ✦</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-semibold tracking-tight leading-[1.1] mb-6">
            Divine Word
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground italic max-w-xl mx-auto mb-8 leading-relaxed">
            A free, beautiful, distraction-free Bible
            <br className="hidden sm:block" />
            for the glory of God
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/bible/genesis/1">
              <Button size="lg" className="gap-2 text-base px-8">
                <Book className="h-4 w-4" />
                Start Reading
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="lg" className="gap-2 text-base px-8">
                <Search className="h-4 w-4" />
                Search Scripture
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Verse of the Day */}
      <section className="py-12 md:py-16">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-sm text-primary font-mono uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Verse of the Day
            </div>
          </div>
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="p-8 md:p-12 text-center">
              <blockquote className="text-xl md:text-2xl leading-relaxed italic mb-6">
                &ldquo;{votd.text}&rdquo;
              </blockquote>
              <Link
                href={`/bible/${votd.book}/${votd.chapter}#v${votd.verse}`}
                className="text-primary hover:underline font-heading font-semibold tracking-wide"
              >
                — {votd.ref} (KJV)
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="font-heading text-sm uppercase tracking-[0.15em] text-primary mb-2">
              Explore
            </p>
            <h2 className="text-2xl md:text-3xl font-heading font-semibold">
              Dive Into Scripture
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/bible" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <Book className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-heading font-semibold mb-2">All Books</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse all 66 books of the Old and New Testament
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-primary mt-3 group-hover:gap-2 transition-all">
                    Browse <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/search" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <Search className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-heading font-semibold mb-2">Search Scripture</h3>
                  <p className="text-sm text-muted-foreground">
                    Find any verse across the entire Bible instantly
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-primary mt-3 group-hover:gap-2 transition-all">
                    Search <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/plans" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <BookMarked className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-heading font-semibold mb-2">Reading Plans</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow guided plans to read through the Bible
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-primary mt-3 group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Testament Quick Nav */}
      <section className="py-12 md:py-16">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="text-primary">✦</span> Old Testament
                <span className="text-xs text-muted-foreground font-mono">39 Books</span>
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {OLD_TESTAMENT.map((book) => (
                  <Link
                    key={book.slug}
                    href={`/bible/${book.slug}/1`}
                    className="text-sm py-1.5 px-2.5 rounded-sm hover:bg-muted transition-colors truncate"
                  >
                    {book.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="text-primary">✦</span> New Testament
                <span className="text-xs text-muted-foreground font-mono">27 Books</span>
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {NEW_TESTAMENT.map((book) => (
                  <Link
                    key={book.slug}
                    href={`/bible/${book.slug}/1`}
                    className="text-sm py-1.5 px-2.5 rounded-sm hover:bg-muted transition-colors truncate"
                  >
                    {book.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Verses */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="font-heading text-sm uppercase tracking-[0.15em] text-primary mb-2">
              Most Loved
            </p>
            <h2 className="text-2xl md:text-3xl font-heading font-semibold">
              Popular Verses
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURED_VERSES.map((v) => (
              <Link
                key={v.ref}
                href={`/bible/${v.book}/${v.chapter}/${v.verse}`}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="p-5">
                    <p className="text-xs text-primary font-mono font-semibold mb-2">
                      {v.ref}
                    </p>
                    <p className="text-sm leading-relaxed line-clamp-3 italic text-muted-foreground group-hover:text-foreground transition-colors">
                      &ldquo;{v.text}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About / SEO Content */}
      <section className="py-12 md:py-16">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold">
              About Divine Word
            </h2>
          </div>
          <div className="prose prose-neutral dark:prose-invert mx-auto text-sm leading-relaxed space-y-4 text-muted-foreground">
            <p>
              Divine Word is a free online Bible designed for focused, distraction-free
              scripture reading. Read the complete King James Version (KJV) — all 66 books,
              1,189 chapters, and 31,102 verses — in a clean, beautiful interface that puts
              God&apos;s Word first.
            </p>
            <p>
              Whether you&apos;re looking up a specific verse, studying a chapter in depth,
              or following a structured reading plan, Divine Word makes it easy to engage with
              scripture every day. Features include full-text search across the entire Bible,
              verse bookmarking, text highlighting, a personal journal, and guided reading
              plans from 30-day devotionals to reading the Bible in a year.
            </p>
            <p>
              The King James Version is in the public domain and remains one of the most
              widely read English translations of the Bible. Divine Word is built with love
              for the glory of God and is free for everyone — no ads, no distractions, just
              the Word.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
