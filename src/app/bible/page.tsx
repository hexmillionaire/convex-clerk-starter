import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OLD_TESTAMENT, NEW_TESTAMENT } from "@/lib/bible-data";

export const metadata: Metadata = {
  title: "All Books",
  description: "Browse all 66 books of the Bible — Old Testament and New Testament.",
};

export default function BibleIndexPage() {
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
      </div>

      {/* Old Testament */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-heading font-semibold text-xl">Old Testament</h2>
          <Badge variant="secondary" className="font-mono text-xs">
            39 Books
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {OLD_TESTAMENT.map((book) => (
            <Link key={book.slug} href={`/bible/${book.slug}/1`}>
              <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-heading font-semibold text-sm">
                      {book.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {book.chapters} {book.chapters === 1 ? "chapter" : "chapters"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground/50 font-mono">
                    {book.abbreviation}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* New Testament */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-heading font-semibold text-xl">New Testament</h2>
          <Badge variant="secondary" className="font-mono text-xs">
            27 Books
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {NEW_TESTAMENT.map((book) => (
            <Link key={book.slug} href={`/bible/${book.slug}/1`}>
              <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-heading font-semibold text-sm">
                      {book.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {book.chapters} {book.chapters === 1 ? "chapter" : "chapters"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground/50 font-mono">
                    {book.abbreviation}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
