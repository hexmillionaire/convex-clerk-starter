"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * The per-user singleton demo. `settings` is null until the first save, so
 * every field falls back to a default. Each control writes only its own
 * field; the mutation upserts.
 */
export function SettingsPanel() {
  const settings = useQuery(api.userSettings.get);
  const update = useMutation(api.userSettings.update);

  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);

  // Seed the input once the server value arrives; don't clobber typing after.
  useEffect(() => {
    if (settings !== undefined) setNickname(settings?.nickname ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings === undefined]);

  if (settings === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  const showCompleted = settings?.showCompleted ?? true;
  const dirty = (settings?.nickname ?? "") !== nickname.trim();

  async function saveNickname() {
    setSaving(true);
    try {
      await update({ nickname: nickname.trim() });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-base">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="nickname" className="text-xs">
            Nickname
          </Label>
          <div className="flex gap-2">
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="What should we call you?"
              maxLength={40}
              className="h-9"
            />
            <Button size="sm" className="h-9" onClick={() => void saveNickname()} disabled={!dirty || saving}>
              Save
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Show completed</p>
            <p className="text-xs text-muted-foreground">Keep finished items in the list.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showCompleted}
            onClick={() => void update({ showCompleted: !showCompleted })}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              showCompleted ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 rounded-full bg-background shadow transition-transform",
                showCompleted ? "translate-x-5.5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed border-t pt-4">
          Stored in the <code className="font-mono">userSettings</code> table — one row per user,
          created on first save.
        </p>
      </CardContent>
    </Card>
  );
}
