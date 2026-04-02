import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getBookBySlug, BIBLE_BOOKS } from "@/lib/bible-data";
import { BOOK_DETAILS } from "@/lib/book-details";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { BookChaptersGrid } from "@/components/book-chapters-grid";

type Props = {
  params: Promise<{ book: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { book: bookSlug } = await params;
  const book = getBookBySlug(bookSlug);

  if (!book) return { title: "Not Found" };

  const details = BOOK_DETAILS[bookSlug];
  const title = `${book.name} — King James Version | Divine Word`;
  const description = details
    ? `${details.description} Read all ${book.chapters} chapters of ${book.name} (KJV) online free.`
    : `Read the Book of ${book.name} in the King James Version. ${book.chapters} chapters available online free.`;

  return {
    title,
    description,
    openGraph: {
      title: `${book.name} KJV — Divine Word`,
      description,
      type: "article",
    },
    alternates: {
      canonical: `https://www.divineword.app/bible/${bookSlug}`,
    },
  };
}

export default async function BookOverviewPage({ params }: Props) {
  const { book: bookSlug } = await params;
  const book = getBookBySlug(bookSlug);

  if (!book) notFound();

  const details = BOOK_DETAILS[bookSlug];
  const prevBook = BIBLE_BOOKS.find((b) => b.position === book.position - 1);
  const nextBook = BIBLE_BOOKS.find((b) => b.position === book.position + 1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.name,
    isPartOf: {
      "@type": "Book",
      name: "The Holy Bible, King James Version",
    },
    numberOfPages: book.chapters,
    genre: details?.genre,
    description: details?.description,
    inLanguage: "en",
    url: `https://www.divineword.app/bible/${bookSlug}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Bible",
        item: "https://www.divineword.app/bible",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: book.name,
        item: `https://www.divineword.app/bible/${bookSlug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, '\\u003c') }}
      />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link
          href="/bible"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono uppercase tracking-wider"
        >
          ← All Books
        </Link>

        {/* Header */}
        <div className="mt-4 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-heading font-semibold">
              {book.name}
            </h1>
            {details && (
              <Badge variant="outline" className="text-xs">
                {details.genre}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{book.abbreviation}</span>
            <span>·</span>
            <span>{book.testament === "OLD" ? "Old Testament" : "New Testament"}</span>
            <span>·</span>
            <span>{book.chapters} {book.chapters === 1 ? "chapter" : "chapters"}</span>
          </div>
          {details && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {details.description}
            </p>
          )}
        </div>

        {/* Start reading CTA */}
        <div className="mb-8">
          <Link href={`/bible/${bookSlug}/1`}>
            <Button className="gap-2">
              <BookOpen className="h-4 w-4" />
              Start Reading {book.name}
            </Button>
          </Link>
        </div>

        {/* Chapters grid */}
        <section>
          <h2 className="font-heading font-semibold text-lg mb-4">Chapters</h2>
          <BookChaptersGrid bookSlug={bookSlug} totalChapters={book.chapters} />
        </section>

        {/* Prev/Next book navigation */}
        <div className="flex items-center justify-between border-t mt-12 pt-6">
          {prevBook ? (
            <Link href={`/bible/${prevBook.slug}`}>
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{prevBook.name}</span>
                <span className="sm:hidden">Previous</span>
              </Button>
            </Link>
          ) : (
            <div />
          )}
          {nextBook ? (
            <Link href={`/bible/${nextBook.slug}`}>
              <Button variant="outline" className="gap-2">
                <span className="hidden sm:inline">{nextBook.name}</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </>
  );
}
