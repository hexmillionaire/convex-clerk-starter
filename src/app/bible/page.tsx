import type { Metadata } from "next";
import { BookBrowser } from "@/components/book-browser";
import { ContinueReadingCard } from "@/components/continue-reading-card";
import { SafeSection } from "@/components/safe-section";
import { BIBLE_BOOKS } from "@/lib/bible-data";

export const metadata: Metadata = {
  title: "Books of the Bible KJV — Divine Word",
  description:
    "Browse all 66 books of the Bible in the King James Version. Old Testament and New Testament with chapter counts. Read online free.",
  openGraph: {
    title: "Books of the Bible — Divine Word",
    description:
      "Browse all 66 books of the Bible. Old Testament and New Testament.",
  },
  alternates: {
    canonical: "https://www.divineword.app/bible",
  },
};

export default function BibleIndexPage() {
  // An ItemList of the 66 books, so the index is legible to crawlers as a
  // table of contents rather than 66 loose links.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Books of the Bible, King James Version",
    numberOfItems: BIBLE_BOOKS.length,
    itemListElement: BIBLE_BOOKS.map((book) => ({
      "@type": "ListItem",
      position: book.position,
      name: book.name,
      url: `https://www.divineword.app/bible/${book.slug}`,
    })),
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="text-center mb-8">
        <p className="text-primary text-xl mb-2">✦</p>
        <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-2">
          The Holy Bible
        </h1>
        <p className="text-muted-foreground italic">
          King James Version — 66 Books
        </p>
      </div>

      {/* Where the reader left off, above the list they'd otherwise scroll */}
      <div className="mb-8">
        <SafeSection>
          <ContinueReadingCard />
        </SafeSection>
      </div>

      <BookBrowser />
    </div>
  );
}
