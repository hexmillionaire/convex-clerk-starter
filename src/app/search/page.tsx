"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SearchResult = {
  bookName: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  text: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);

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
            No results found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different word or phrase
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-4 font-mono">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          <div className="space-y-3">
            {results.map((r, i) => (
              <Link
                key={i}
                href={`/bible/${r.bookSlug}/${r.chapter}#v${r.verse}`}
              >
                <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                  <CardContent className="p-4">
                    <p className="text-xs text-primary font-mono font-semibold mb-1">
                      {r.bookName} {r.chapter}:{r.verse}
                    </p>
                    <p className="text-sm leading-relaxed line-clamp-2">
                      {r.text}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
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
