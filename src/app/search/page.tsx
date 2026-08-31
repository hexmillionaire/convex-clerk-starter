import { Suspense } from "react";
import { SearchClient } from "./search-client";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * `useSearchParams` needs a Suspense boundary for the page to prerender, and
 * the query now lives in the URL so results can be linked to.
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchClient />
    </Suspense>
  );
}

function SearchSkeleton() {
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
      <div className="flex gap-2 mb-8">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-28" />
      </div>
    </div>
  );
}
