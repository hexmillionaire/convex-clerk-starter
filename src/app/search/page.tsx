"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Search as SearchIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [searchedQuery, setSearchedQuery] = useState("");

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);
    setPage(1);
    setSearchedQuery(trimmed);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(trimmed)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setTotal(data.total || 0);
      } else {
        setResults([]);
        setTotal(0);
      }
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const paginatedResults = useMemo(
    () => results.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE),
    [results, page]
  );

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
        <Button onClick={handleSearch} disabled={loading} className="gap-2">
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
          <p className="text-sm text-muted-foreground mb-4 font-mono">
            {results.length} of {total} result{total !== 1 ? "s" : ""}
            {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
          </p>
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
                  setTimeout(() => {
                    handleSearch();
                  }, 0);
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
