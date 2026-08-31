"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BIBLE_BOOKS, type BookInfo } from "@/lib/bible-data";
import { BOOK_DETAILS } from "@/lib/book-details";
import { cn } from "@/lib/utils";

type Testament = "all" | "OLD" | "NEW";

const TABS: { value: Testament; label: string; short: string }[] = [
  { value: "all", label: "All Books", short: "All" },
  { value: "OLD", label: "Old Testament", short: "Old" },
  { value: "NEW", label: "New Testament", short: "New" },
];

/**
 * Finding a book used to mean scrolling 66 description cards — about 9,500px
 * on a phone. The filter field and testament tabs are the fix; the tabs were
 * half-built already, as a `?testament=` param with no UI to reach it.
 *
 * Compact screens get dense rows, wide screens keep the description cards.
 * Both render from the same server-rendered list, so the books are in the HTML
 * either way.
 */
export function BookBrowser() {
  const [query, setQuery] = useState("");
  const [testament, setTestament] = useState<Testament>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BIBLE_BOOKS.filter((book) => {
      if (testament !== "all" && book.testament !== testament) return false;
      if (!q) return true;
      return (
        book.name.toLowerCase().includes(q) ||
        book.abbreviation.toLowerCase().includes(q) ||
        BOOK_DETAILS[book.slug]?.genre.toLowerCase().includes(q)
      );
    });
  }, [query, testament]);

  const oldCount = filtered.filter((b) => b.testament === "OLD").length;
  const newCount = filtered.length - oldCount;

  return (
    <div>
      {/* Sticky finder — stays reachable through a long list */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-border/50 bg-background/90 px-4 py-3 backdrop-blur-xl">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Find a book"
            placeholder="Find a book…"
            className="h-11 pl-10 pr-10"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear"
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-2.5 flex gap-1.5" role="tablist" aria-label="Testament">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={testament === tab.value}
              onClick={() => setTestament(tab.value)}
              className={cn(
                "h-10 flex-1 rounded-lg border px-3 font-mono text-xs tracking-wide transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                testament === tab.value
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="sm:hidden">{tab.short}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground italic">
          No book matches &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <>
          {/* Compact rows on phones */}
          <ul className="flex flex-col sm:hidden">
            {filtered.map((book) => (
              <li key={book.slug}>
                <Link
                  href={`/bible/${book.slug}`}
                  className="flex h-12 items-center justify-between gap-3 border-b border-border/50 px-1 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <span className="truncate font-heading text-[0.9375rem]">
                    {book.name}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                    {book.chapters}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Description cards from `sm` up */}
          <div className="hidden gap-3 sm:grid sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((book) => (
              <BookCard key={book.slug} book={book} />
            ))}
          </div>

          <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
            {oldCount > 0 && `${oldCount} Old Testament`}
            {oldCount > 0 && newCount > 0 && " · "}
            {newCount > 0 && `${newCount} New Testament`}
          </p>
        </>
      )}
    </div>
  );
}

function BookCard({ book }: { book: BookInfo }) {
  const details = BOOK_DETAILS[book.slug];
  return (
    <Link
      href={`/bible/${book.slug}`}
      className="rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="p-4">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="font-heading text-sm font-semibold">{book.name}</p>
            {details && (
              <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
                {details.genre}
              </Badge>
            )}
          </div>
          {details && (
            <p className="mb-1 line-clamp-1 text-xs text-muted-foreground">
              {details.description}
            </p>
          )}
          <p className="font-mono text-xs text-muted-foreground/80 tabular-nums">
            {book.chapters} {book.chapters === 1 ? "chapter" : "chapters"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
