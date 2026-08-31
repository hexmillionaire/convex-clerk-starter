import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBookBySlug, BIBLE_BOOKS } from "@/lib/bible-data";
import { getChapter } from "@/lib/kjv";
import { ChapterReader } from "./chapter-reader";

type Props = {
  params: Promise<{ book: string; chapter: string }>;
};

export const revalidate = 604800;

/**
 * Prerender all 1,189 chapters. The KJV ships with the app, so this is a build
 * step over local files rather than 1,189 calls to a third-party API — and it
 * is what puts scripture in the HTML for crawlers that don't run JavaScript.
 */
export function generateStaticParams() {
  return BIBLE_BOOKS.flatMap((book) =>
    Array.from({ length: book.chapters }, (_, i) => ({
      book: book.slug,
      chapter: String(i + 1),
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { book: bookSlug, chapter: chapterStr } = await params;
  const book = getBookBySlug(bookSlug);
  const chapter = parseInt(chapterStr, 10);

  if (!book || isNaN(chapter) || chapter < 1 || chapter > book.chapters) {
    return { title: "Not Found" };
  }

  const title = `${book.name} ${chapter} KJV — Divine Word`;
  const description = `Read ${book.name} Chapter ${chapter} in the King James Version. Free online Bible at Divine Word.`;

  return {
    title,
    description,
    openGraph: {
      title: `${book.name} ${chapter} — Divine Word`,
      description,
      type: "article",
    },
    alternates: {
      canonical: `https://www.divineword.app/bible/${bookSlug}/${chapter}`,
    },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { book: bookSlug, chapter: chapterStr } = await params;
  const book = getBookBySlug(bookSlug);
  const chapter = parseInt(chapterStr, 10);

  if (!book || isNaN(chapter) || chapter < 1 || chapter > book.chapters) {
    notFound();
  }

  const verses = await getChapter(book.slug, chapter);
  if (!verses) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: `${book.name} ${chapter}`,
    isPartOf: {
      "@type": "Book",
      name: book.name,
      isPartOf: {
        "@type": "Book",
        name: "The Holy Bible, King James Version",
      },
    },
    position: chapter,
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
      {
        "@type": "ListItem",
        position: 3,
        name: `Chapter ${chapter}`,
        item: `https://www.divineword.app/bible/${bookSlug}/${chapter}`,
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
      <ChapterReader book={book} chapter={chapter} initialVerses={verses} />
    </>
  );
}
