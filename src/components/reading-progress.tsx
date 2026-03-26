"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Props = {
  bookSlug: string;
  chapter: number;
  totalChapters: number;
};

type Progress = Record<number, boolean>;

export function ReadingProgress({ bookSlug, chapter, totalChapters }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress>({});
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const isRead = progress[chapter] ?? false;

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Load progress for this book from reading_progress table
      const { data } = await supabase
        .from("reading_progress")
        .select("chapter")
        .eq("userId", user.id)
        .eq("bookSlug", bookSlug);

      if (data) {
        const map: Progress = {};
        for (const row of data) {
          map[row.chapter] = true;
        }
        setProgress(map);
      }
    };
    load();
  }, [supabase, bookSlug]);

  const toggleRead = useCallback(async () => {
    if (!userId) return;
    setSaving(true);

    if (isRead) {
      await supabase
        .from("reading_progress")
        .delete()
        .eq("userId", userId)
        .eq("bookSlug", bookSlug)
        .eq("chapter", chapter);

      setProgress((prev) => {
        const next = { ...prev };
        delete next[chapter];
        return next;
      });
    } else {
      await supabase.from("reading_progress").upsert(
        { userId, bookSlug, chapter, completed: true },
        { onConflict: "userId,bookSlug,chapter" }
      );

      setProgress((prev) => ({ ...prev, [chapter]: true }));
    }

    setSaving(false);
  }, [userId, isRead, supabase, bookSlug, chapter]);

  const readCount = Object.keys(progress).length;
  const pct = totalChapters > 0 ? Math.round((readCount / totalChapters) * 100) : 0;

  if (!userId) return null;

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isRead ? "secondary" : "outline"}
        size="sm"
        className="gap-2 text-xs"
        onClick={toggleRead}
        disabled={saving}
      >
        <CheckCircle
          className={`h-3.5 w-3.5 ${isRead ? "text-green-600" : "text-muted-foreground"}`}
        />
        {isRead ? "Read" : "Mark as read"}
      </Button>

      <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary/60 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono tabular-nums">
          {readCount}/{totalChapters}
        </span>
      </div>
    </div>
  );
}
