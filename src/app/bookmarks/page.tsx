"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Bookmark,
  Lock,
  Trash2,
  Loader2,
  FolderOpen,
  Tag,
  X,
} from "lucide-react";

export default function BookmarksPage() {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const bookmarks = useQuery(api.bookmarks.list);
  const collections = useQuery(api.bookmarks.listCollections);
  const removeBookmark = useMutation(api.bookmarks.remove);
  const updateCollection = useMutation(api.bookmarks.updateCollection);

  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCollection, setNewCollection] = useState("");

  if (!clerkLoaded) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
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

  const filtered = activeCollection
    ? bookmarks?.filter(
        (bm) =>
          (activeCollection === "Uncategorized" && !bm.collection) ||
          bm.collection === activeCollection
      )
    : bookmarks;

  const handleSetCollection = async (
    bookmarkId: string,
    collection: string
  ) => {
    await updateCollection({
      id: bookmarkId as Id<"bookmarks">,
      collection: collection || undefined,
    });
    setEditingId(null);
    setNewCollection("");
  };

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

      {/* Collection filter */}
      {collections && collections.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeCollection === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCollection(null)}
          >
            All
          </Button>
          <Button
            variant={activeCollection === "Uncategorized" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCollection("Uncategorized")}
          >
            Uncategorized
          </Button>
          {collections.map((col) => (
            <Button
              key={col}
              variant={activeCollection === col ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCollection(col)}
              className="gap-1"
            >
              <FolderOpen className="h-3 w-3" />
              {col}
            </Button>
          ))}
        </div>
      )}

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
          <Link href="/bible" className="mt-4 inline-block">
            <Button variant="outline" className="gap-2">
              Start Reading
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(filtered ?? []).map((bm) => (
            <Card key={bm._id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/bible/${bm.bookSlug}/${bm.chapter}#v${bm.verseNumber}`}
                        className="text-xs text-primary font-mono font-semibold hover:underline"
                      >
                        {bm.reference}
                      </Link>
                      {bm.collection && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] gap-1"
                        >
                          <FolderOpen className="h-2.5 w-2.5" />
                          {bm.collection}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm mt-1 leading-relaxed">{bm.text}</p>

                    {/* Collection editor */}
                    {editingId === bm._id ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          className="h-7 text-xs"
                          placeholder="Collection name (e.g. Promises)"
                          value={newCollection}
                          onChange={(e) => setNewCollection(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              void handleSetCollection(bm._id, newCollection);
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            void handleSetCollection(bm._id, newCollection)
                          }
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingId(null);
                            setNewCollection("");
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] text-muted-foreground mt-1 gap-1 px-1"
                        onClick={() => {
                          setEditingId(bm._id);
                          setNewCollection(bm.collection ?? "");
                        }}
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {bm.collection ? "Change collection" : "Add to collection"}
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    aria-label="Remove bookmark"
                    onClick={() => removeBookmark({ id: bm._id })}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
