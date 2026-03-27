import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OLD_TESTAMENT, NEW_TESTAMENT } from "@/lib/bible-data";
import { BOOK_DETAILS } from "@/lib/book-details";

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

type Props = {
  searchParams: Promise<{ testament?: string }>;
};

export default async function BibleIndexPage({ searchParams }: Props) {
  const { testament } = await searchParams;
  const showOT = !testament || testament === "old";
  const showNT = !testament || testament === "new";

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <p className="text-primary text-xl mb-2">✦</p>
        <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-2">
          The Holy Bible
        </h1>
        <p className="text-muted-foreground italic">
          King James Version — 66 Books
        </p>
        {testament && (
          <Link
            href="/bible"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            Show All Books
          </Link>
        )}
      </div>

      {/* Old Testament */}
      {showOT && (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-heading font-semibold text-xl">Old Testament</h2>
          <Badge variant="secondary" className="font-mono text-xs">
            39 Books
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {OLD_TESTAMENT.map((book) => {
            const details = BOOK_DETAILS[book.slug];
            return (
            <Link key={book.slug} href={`/bible/${book.slug}/1`}>
              <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-heading font-semibold text-sm">
                      {book.name}
                    </p>
                    {details && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {details.genre}
                      </Badge>
                    )}
                  </div>
                  {details && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                      {details.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60 font-mono">
                    {book.chapters} {book.chapters === 1 ? "chapter" : "chapters"}
                  </p>
                </CardContent>
              </Card>
            </Link>
            );
          })}
        </div>
      </section>
      )}

      {/* New Testament */}
      {showNT && (
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-heading font-semibold text-xl">New Testament</h2>
          <Badge variant="secondary" className="font-mono text-xs">
            27 Books
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {NEW_TESTAMENT.map((book) => {
            const details = BOOK_DETAILS[book.slug];
            return (
            <Link key={book.slug} href={`/bible/${book.slug}/1`}>
              <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-heading font-semibold text-sm">
                      {book.name}
                    </p>
                    {details && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {details.genre}
                      </Badge>
                    )}
                  </div>
                  {details && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                      {details.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60 font-mono">
                    {book.chapters} {book.chapters === 1 ? "chapter" : "chapters"}
                  </p>
                </CardContent>
              </Card>
            </Link>
            );
          })}
        </div>
      </section>
      )}
    </div>
  );
}
