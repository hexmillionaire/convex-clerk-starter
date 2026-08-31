"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useUser } from "@/lib/auth";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConnectingState } from "@/components/connecting-state";
import { Id } from "@convex/_generated/dataModel";
import { PenLine, Plus, BookOpen, Lock, Trash2, Loader2, Pencil } from "lucide-react";
import Link from "next/link";

export default function JournalPage() {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const entries = useQuery(api.journal.list, isAuthenticated ? {} : "skip");
  const createEntry = useMutation(api.journal.create);
  const removeEntry = useMutation(api.journal.remove);
  const updateEntry = useMutation(api.journal.update);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [passage, setPassage] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  // Which entry is awaiting a delete confirmation, if any.
  const [confirmDelete, setConfirmDelete] = useState<Id<"journal"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<Id<"journal"> | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPassage, setEditPassage] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const handleUpdate = async (id: Id<"journal">) => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSavingEdit(true);
    try {
      await updateEntry({
        id,
        title: editTitle.trim(),
        passage: editPassage.trim(),
        content: editContent.trim(),
      });
      setEditingId(null);
    } catch {
      // Auth may not be ready; keep the editor open
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createEntry({
        title: title.trim(),
        passage: passage.trim(),
        content: content.trim(),
      });
      setTitle("");
      setPassage("");
      setContent("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
          Devotional Journal
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Sign in to keep a private devotional journal with your reflections on
          scripture.
        </p>
        <Link href="/login">
          <Button className="gap-2">Sign In to Continue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            Devotional Journal
          </h1>
          <p className="text-sm text-muted-foreground">
            Your private reflections on scripture
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* New entry form */}
      {showForm && (
        <Card className="mb-8 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Reflections on God's faithfulness"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passage">Passage Reference</Label>
              <Input
                id="passage"
                placeholder="e.g. Psalm 23:1-6"
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Your Thoughts</Label>
              <Textarea
                id="content"
                placeholder="Write your reflection..."
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Entry
              </Button>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries */}
      {entries === undefined ? (
        <ConnectingState authPending={isSignedIn && !isAuthenticated} />
      ) : entries.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground italic">
            Start your first journal entry
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Record what God is teaching you through His Word
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry._id}>
              <CardContent className="p-5">
                {editingId === entry._id ? (
                  <div className="space-y-3">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title"
                    />
                    <Input
                      value={editPassage}
                      onChange={(e) => setEditPassage(e.target.value)}
                      placeholder="Passage Reference (optional)"
                    />
                    <Textarea
                      rows={5}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Your reflection..."
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        disabled={savingEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => void handleUpdate(entry._id)}
                        disabled={savingEdit}
                      >
                        {savingEdit && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-heading font-semibold">{entry.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(entry._creationTime).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label="Edit entry"
                          onClick={() => {
                            setEditingId(entry._id);
                            setEditTitle(entry.title);
                            setEditPassage(entry.passage);
                            setEditContent(entry.content);
                          }}
                        >
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                        </Button>
                        {/* Two-step: a single tap at a card's edge used to
                            delete a written reflection outright, with no undo. */}
                        {confirmDelete === entry._id ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 text-xs"
                            aria-label={`Confirm deleting the entry from ${new Date(entry._creationTime).toLocaleDateString()}`}
                            onClick={() => {
                              setConfirmDelete(null);
                              removeEntry({ id: entry._id }).catch(() => {});
                            }}
                          >
                            Delete?
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            aria-label="Delete entry"
                            onClick={() => setConfirmDelete(entry._id)}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {entry.passage && (
                      <p className="text-xs text-primary font-mono mb-2">
                        📖 {entry.passage}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
