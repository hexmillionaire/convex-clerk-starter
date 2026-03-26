"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Lock, Trash2, Loader2 } from "lucide-react";

export default function BookmarksPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const bookmarks = useQuery(api.bookmarks.list);
  const removeBookmark = useMutation(api.bookmarks.remove);

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-md mx-auto px-4 py-20 text-center">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h1 className="text-xl font-heading font-semibold mb-2">
          Bookmarked Verses
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Sign in to save your favourite verses and access them from any device.
        </p>
        <Link href="/login">
          <Button className="gap-2">Sign In to Continue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-semibold flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-primary" />
          Bookmarked Verses
        </h1>
        <p className="text-sm text-muted-foreground">
          Your saved verses, synced across devices
        </p>
      </div>

      {bookmarks === undefined ? (
        <div className="text-center py-16">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground italic">No bookmarks yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tap the bookmark icon on any verse while reading to save it here
          </p>
          <Link href="/bible/genesis/1" className="mt-4 inline-block">
            <Button variant="outline" className="gap-2">
              Start Reading
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bm) => (
            <Card key={bm._id}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex-1">
                  <Link
                    href={`/bible/${bm.bookSlug}/${bm.chapter}#v${bm.verseNumber}`}
                    className="text-xs text-primary font-mono font-semibold hover:underline"
                  >
                    {bm.reference}
                  </Link>
                  <p className="text-sm mt-1 leading-relaxed">{bm.text}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeBookmark({ id: bm._id })}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
