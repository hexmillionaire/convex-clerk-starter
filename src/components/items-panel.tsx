"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Plus, Trash2, Circle, CheckCircle2 } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * The realtime CRUD demo. Everything here is the pattern to copy for any
 * per-user list:
 *
 *   useQuery   → subscribes; re-renders on every change, from any tab/device
 *   useMutation→ writes; Convex updates the query result, no refetch needed
 *   undefined  → still loading (show a skeleton), []/null → loaded and empty
 */
export function ItemsPanel() {
  const items = useQuery(api.items.list);
  const settings = useQuery(api.userSettings.get);
  const add = useMutation(api.items.add);
  const toggle = useMutation(api.items.toggle);
  const remove = useMutation(api.items.remove);
  const clearCompleted = useMutation(api.items.clearCompleted);

  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);

  const showCompleted = settings?.showCompleted ?? true;
  const visible = items?.filter((i) => showCompleted || !i.completed);
  const doneCount = items?.filter((i) => i.completed).length ?? 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t || pending) return;
    setPending(true);
    try {
      await add({ title: t });
      setTitle("");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-base">Items</CardTitle>
        {doneCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => void clearCompleted()}
          >
            Clear {doneCount} done
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add something…"
            aria-label="New item"
            className="h-10"
            maxLength={200}
          />
          <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={!title.trim() || pending}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add</span>
          </Button>
        </form>

        {visible === undefined ? (
          <div className="space-y-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-2/3" />
          </div>
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {items && items.length > 0
              ? "All done. Toggle “show completed” in settings to see them."
              : "Nothing yet. Add your first item above."}
          </p>
        ) : (
          <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
            {visible.map((item) => (
              <ItemRow
                key={item._id}
                id={item._id}
                title={item.title}
                completed={item.completed}
                onToggle={() => void toggle({ id: item._id })}
                onRemove={() => void remove({ id: item._id })}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ItemRow({
  title,
  completed,
  onToggle,
  onRemove,
}: {
  id: Id<"items">;
  title: string;
  completed: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="group flex items-center gap-3 px-3 py-2.5">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={completed}
        aria-label={completed ? "Mark as not done" : "Mark as done"}
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        {completed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}
      </button>
      <span className={cn("flex-1 text-sm truncate", completed && "line-through text-muted-foreground")}>
        {title}
      </span>
      {completed && <Check className="h-3.5 w-3.5 text-primary/60 md:hidden" />}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
        onClick={onRemove}
        aria-label="Delete item"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}
