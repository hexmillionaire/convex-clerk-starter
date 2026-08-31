"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useIsCompact } from "@/lib/use-media-query";

const RESULTS_PER_PAGE = 20;

type SearchResult = {
  bookName: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  text: string;
};

type Testament = "all" | "OLD" | "NEW";

function HighlightedText({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;

  // Match the whole phrase first, then any single term, mirroring how results
  // are ranked so the highlight explains the ordering.
  const terms = [trimmed, ...trimmed.split(/\s+/)].filter((t) => t.length > 1);
  const escaped = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length)
    .join("|");

  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  const lowered = new Set(terms.map((t) => t.toLowerCase()));

  return (
    <>
      {parts.map((part, i) =>
        lowered.has(part.toLowerCase()) ? (
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

const POPULAR = [
  "love", "faith", "hope", "salvation", "grace", "forgiveness",
  "peace", "strength", "prayer", "wisdom", "mercy", "joy",
];

export function SearchClient() {
  const router = useRouter();
  const params = useSearchParams();
  const isCompact = useIsCompact();

  // The URL is the source of truth for what has been searched, so a result
  // page can be bookmarked, shared, and reached with the back button.
  const submittedQuery = params.get("q")?.trim() ?? "";
  const bookFilter = params.get("book") ?? "all";
  const testamentFilter = (params.get("testament") ?? "all") as Testament;
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  const [draft, setDraft] = useState(submittedQuery);

  // One keyed response rather than four pieces of state: everything shown is
  // derived from whether the stored response matches the current request, so
  // an in-flight or stale search can't leave the page half-updated.
  const requestKey = `${submittedQuery}|${bookFilter}|${testamentFilter}`;
  const [response, setResponse] = useState<{
    key: string;
    results: SearchResult[];
    total: number;
    truncated: boolean;
  } | null>(null);

  const current = response?.key === requestKey ? response : null;
  const results = current?.results ?? [];
  const total = current?.total ?? 0;
  const truncated = current?.truncated ?? false;
  const loading = submittedQuery !== "" && current === null;

  // Keep the input in step when the query changes from outside the field —
  // the back button, or a popular-search chip.
  const lastSyncedQuery = useRef(submittedQuery);
  if (lastSyncedQuery.current !== submittedQuery) {
    lastSyncedQuery.current = submittedQuery;
    if (draft !== submittedQuery) setDraft(submittedQuery);
  }

  const updateUrl = useCallback(
    (next: Record<string, string | null>) => {
      const search = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value === null || value === "" || value === "all") search.delete(key);
        else search.set(key, value);
      }
      const qs = search.toString();
      router.push(qs ? `/search?${qs}` : "/search", { scroll: false });
    },
    [params, router]
  );

  // Filters are applied by the API rather than to the returned page of
  // results, so narrowing to a book searches the whole book, not the first
  // few hundred hits.
  useEffect(() => {
    if (!submittedQuery) return;

    const controller = new AbortController();
    const search = new URLSearchParams({ q: submittedQuery });
    if (bookFilter !== "all") search.set("book", bookFilter);
    if (testamentFilter !== "all") search.set("testament", testamentFilter);

    fetch(`/api/search?${search}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("search failed"))))
      .then((data) => {
        setResponse({
          key: requestKey,
          results: data.results ?? [],
          total: data.total ?? 0,
          truncated: !!data.truncated,
        });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setResponse({ key: requestKey, results: [], total: 0, truncated: false });
      });

    return () => controller.abort();
  }, [requestKey, submittedQuery, bookFilter, testamentFilter]);

  const submit = (value?: string) => {
    const next = (value ?? draft).trim();
    if (!next) return;
    updateUrl({ q: next, page: null, book: null, testament: null });
  };

  const totalPages = Math.max(1, Math.ceil(results.length / RESULTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = results.slice(
    (safePage - 1) * RESULTS_PER_PAGE,
    safePage * RESULTS_PER_PAGE
  );

  const booksInResults = BIBLE_BOOKS.filter(
    (b) => testamentFilter === "all" || b.testament === testamentFilter
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
          <SearchIcon
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            // Focusing on load helps on desktop; on touch it would raise the
            // keyboard over the page before anyone asked for it.
            autoFocus={!isCompact}
            type="search"
            aria-label="Search the Bible"
            placeholder="Search for a word, phrase, or reference..."
            className="pl-10 h-11"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <Button onClick={() => submit()} disabled={loading} className="h-11 gap-2 px-5">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SearchIcon className="h-4 w-4" />
          )}
          Search
        </Button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground mt-2">Searching...</p>
        </div>
      )}

      {!loading && submittedQuery && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground italic">
            No results found for &ldquo;{submittedQuery}&rdquo;
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
                updateUrl({ testament: v, book: null, page: null });
              }}
            >
              <SelectTrigger className="w-40 h-11" aria-label="Filter by testament">
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
                updateUrl({ book: v, page: null });
              }}
            >
              <SelectTrigger className="w-48 h-11" aria-label="Filter by book">
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
                className="h-11"
                onClick={() => updateUrl({ book: null, testament: null, page: null })}
              >
                Clear filters
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4 font-mono" aria-live="polite">
            {total.toLocaleString()} result{total !== 1 ? "s" : ""}
            {truncated && ` · showing the first ${results.length.toLocaleString()}`}
            {totalPages > 1 && ` · Page ${safePage} of ${totalPages}`}
          </p>

          <div className="space-y-3">
            {paginated.map((r) => (
              <Link
                key={`${r.bookSlug}-${r.chapter}-${r.verse}`}
                href={`/bible/${r.bookSlug}/${r.chapter}/${r.verse}`}
                className="block rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="p-4">
                    <p className="text-xs text-primary font-mono font-semibold mb-1">
                      {r.bookName} {r.chapter}:{r.verse}
                    </p>
                    <p className="text-sm leading-relaxed line-clamp-3">
                      <HighlightedText text={r.text} query={submittedQuery} />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                className="h-11"
                disabled={safePage === 1}
                onClick={() => {
                  updateUrl({ page: String(safePage - 1) });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground font-mono px-3 tabular-nums">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                className="h-11"
                disabled={safePage === totalPages}
                onClick={() => {
                  updateUrl({ page: String(safePage + 1) });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Popular searches */}
      {!submittedQuery && !loading && (
        <div className="mt-8">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">
            Popular Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((term) => (
              <Button
                key={term}
                variant="outline"
                className="h-11 px-4 text-sm"
                onClick={() => submit(term)}
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
