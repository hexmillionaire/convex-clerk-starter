"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PenLine, Plus, BookOpen, Lock } from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  passage: string;
  createdAt: string;
};

export default function JournalPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [passage, setPassage] = useState("");
  const [content, setContent] = useState("");

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    getUser();
  }, [supabase.auth]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      passage: passage.trim(),
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [entry, ...prev]);
    setTitle("");
    setPassage("");
    setContent("");
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
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
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
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
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Entry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries */}
      {entries.length === 0 && !showForm && (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground italic">
            Start your first journal entry
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Record what God is teaching you through His Word
          </p>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-heading font-semibold">{entry.title}</h3>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
              {entry.passage && (
                <p className="text-xs text-primary font-mono mb-2">
                  📖 {entry.passage}
                </p>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
