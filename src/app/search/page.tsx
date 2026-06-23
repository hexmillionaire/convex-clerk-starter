"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Search as SearchIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BIBLE_BOOKS } from "@/lib/bible-data";

const RESULTS_PER_PAGE = 20;

type SearchResult = {
  bookName: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  text: string;
};

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [testamentFilter, setTestamentFilter] = useState<"all" | "OLD" | "NEW">("all");
  const [bookFilter, setBookFilter] = useState<string>("all");

  const handleSearch = useCallback(async (overrideQuery?: string) => {
    const trimmed = (overrideQuery ?? query).trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);
    setPage(1);
    setTestamentFilter("all");
    setBookFilter("all");
    setSearchedQuery(trimmed);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(trimmed)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const filteredResults = useMemo(() => {
    if (testamentFilter === "all" && bookFilter === "all") return results;
    return results.filter((r) => {
      if (bookFilter !== "all") return r.bookSlug === bookFilter;
      const book = BIBLE_BOOKS.find((b) => b.slug === r.bookSlug);
      return book?.testament === testamentFilter;
    });
  }, [results, testamentFilter, bookFilter]);

  const totalPages = Math.ceil(filteredResults.length / RESULTS_PER_PAGE);
  const paginatedResults = useMemo(
    () => filteredResults.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE),
    [filteredResults, page]
  );

  // Books available in the current result set, narrowed by the testament filter.
  const booksInResults = useMemo(() => {
    const slugs = new Set(results.map((r) => r.bookSlug));
    return BIBLE_BOOKS.filter(
      (b) =>
        slugs.has(b.slug) &&
        (testamentFilter === "all" || b.testament === testamentFilter)
    );
  }, [results, testamentFilter]);

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <p className="text-primary text-lg mb-2">✦</p>
        <h1 className="text-2xl md:text-3xl font-heading font-semibold mb-2">
          Search Scripture
        </h1>
        <p className="text-sm text-muted-foreground italic">
          Find any word or phrase across the entire Bible
        </p>
      </div>

      {/* Search input */}
      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a word, phrase, or reference..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={() => handleSearch()} disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SearchIcon className="h-4 w-4" />
          )}
          Search
        </Button>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground mt-2">Searching...</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground italic">
            No results found for &ldquo;{searchedQuery}&rdquo;
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different word or phrase
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Select
              value={testamentFilter}
              onValueChange={(v) => {
                if (!v) return;
                setTestamentFilter(v as "all" | "OLD" | "NEW");
                setBookFilter("all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Testaments</SelectItem>
                <SelectItem value="OLD">Old Testament</SelectItem>
                <SelectItem value="NEW">New Testament</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={bookFilter}
              onValueChange={(v) => {
                if (!v) return;
                setBookFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                {booksInResults.map((b) => (
                  <SelectItem key={b.slug} value={b.slug}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(testamentFilter !== "all" || bookFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTestamentFilter("all");
                  setBookFilter("all");
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4 font-mono" aria-live="polite">
            {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
            {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
          </p>

          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground italic">
                No results in the selected books.
              </p>
            </div>
          ) : (
          <>
          <div className="space-y-3">
            {paginatedResults.map((r, i) => (
              <Link
                key={`${r.bookSlug}-${r.chapter}-${r.verse}-${i}`}
                href={`/bible/${r.bookSlug}/${r.chapter}/${r.verse}`}
              >
                <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                  <CardContent className="p-4">
                    <p className="text-xs text-primary font-mono font-semibold mb-1">
                      {r.bookName} {r.chapter}:{r.verse}
                    </p>
                    <p className="text-sm leading-relaxed line-clamp-2">
                      <HighlightedText text={r.text} query={searchedQuery} />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground font-mono px-3">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          </>
          )}
        </div>
      )}

      {/* Popular searches */}
      {!searched && (
        <div className="mt-8">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">
            Popular Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "love",
              "faith",
              "hope",
              "salvation",
              "grace",
              "forgiveness",
              "peace",
              "strength",
              "prayer",
              "wisdom",
              "mercy",
              "joy",
            ].map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setQuery(term);
                  handleSearch(term);
                }}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
