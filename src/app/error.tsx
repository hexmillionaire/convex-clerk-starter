"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="container max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-4xl mb-4">⚠️</p>
      <h2 className="text-xl font-heading font-semibold mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex gap-3 justify-center">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
