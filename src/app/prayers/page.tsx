"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConnectingState } from "@/components/connecting-state";
import { Id } from "@convex/_generated/dataModel";
import {
  HandHeart,
  Plus,
  Lock,
  Trash2,
  Loader2,
  Check,
  Heart,
  Users,
  Globe,
  Sparkles,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "personal", label: "Personal", icon: Heart },
  { value: "family", label: "Family", icon: Users },
  { value: "community", label: "Community", icon: Globe },
  { value: "praise", label: "Praise", icon: Sparkles },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export default function PrayersPage() {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const prayers = useQuery(api.prayerJournal.list, isAuthenticated ? {} : "skip");
  const addPrayer = useMutation(api.prayerJournal.add);
  const markAnswered = useMutation(api.prayerJournal.markAnswered);
  const removePrayer = useMutation(api.prayerJournal.remove);
  const updatePrayer = useMutation(api.prayerJournal.update);

  const [showForm, setShowForm] = useState(false);
  const [request, setRequest] = useState("");
  const [category, setCategory] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "answered">("all");
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<Id<"prayerJournal"> | null>(null);
  const [editRequest, setEditRequest] = useState("");
  const [editCategory, setEditCategory] = useState("personal");
  const [savingEdit, setSavingEdit] = useState(false);

  const handleUpdate = async (id: Id<"prayerJournal">) => {
    if (!editRequest.trim()) return;
    setSavingEdit(true);
    try {
      await updatePrayer({
        id,
        request: editRequest.trim(),
        category: editCategory,
      });
      setEditingId(null);
    } catch {
      // Auth may not be ready; keep the editor open
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSave = async () => {
    if (!request.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await addPrayer({ request: request.trim(), category });
      setRequest("");
      setCategory("personal");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save prayer. Please try again.");
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
          Prayer Journal
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Sign in to keep a private prayer journal.
        </p>
        <Link href="/login">
          <Button className="gap-2">Sign In to Continue</Button>
        </Link>
      </div>
    );
  }

  const filtered =
    prayers?.filter((p) => {
      if (filter === "active") return !p.answered;
      if (filter === "answered") return p.answered;
      return true;
    }) ?? [];

  const activePrayers = prayers?.filter((p) => !p.answered).length ?? 0;
  const answeredPrayers = prayers?.filter((p) => p.answered).length ?? 0;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-primary" />
            Prayer Journal
          </h1>
          <p className="text-sm text-muted-foreground">
            Your private prayer requests and praises
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Prayer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-heading font-bold">{prayers?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground font-mono">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-heading font-bold">{activePrayers}</p>
            <p className="text-xs text-muted-foreground font-mono">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-heading font-bold text-green-600">{answeredPrayers}</p>
            <p className="text-xs text-muted-foreground font-mono">Answered</p>
          </CardContent>
        </Card>
      </div>

      {/* New prayer form */}
      {showForm && (
        <Card className="mb-8 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={(v) => { if (v) setCategory(v); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prayer Request</label>
              <Textarea
                placeholder="Write your prayer request or praise..."
                rows={4}
                value={request}
                onChange={(e) => setRequest(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Prayer
              </Button>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "active", "answered"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Prayers list */}
      {prayers === undefined ? (
        <ConnectingState authPending={isSignedIn && !isAuthenticated} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <HandHeart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground italic">
            {filter === "all"
              ? "No prayers yet. Add your first prayer request."
              : filter === "active"
                ? "No active prayers."
                : "No answered prayers yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((prayer) => (
            <Card
              key={prayer._id}
              className={prayer.answered ? "opacity-75" : ""}
            >
              <CardContent className="p-4">
                {editingId === prayer._id ? (
                  <div className="space-y-3">
                    <Select
                      value={editCategory}
                      onValueChange={(v) => { if (v) setEditCategory(v); }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      rows={4}
                      value={editRequest}
                      onChange={(e) => setEditRequest(e.target.value)}
                      placeholder="Write your prayer request or praise..."
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
                        onClick={() => void handleUpdate(prayer._id)}
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
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {categoryLabel(prayer.category)}
                        </Badge>
                        {prayer.answered && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                            Answered
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(prayer._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
                      {prayer.request}
                    </p>
                    {prayer.answeredNote && (
                      <p className="text-xs text-green-600 dark:text-green-400 italic border-l-2 border-green-500 pl-2 mb-3">
                        {prayer.answeredNote}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {!prayer.answered && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => { markAnswered({ id: prayer._id }).catch(() => {}); }}
                        >
                          <Check className="h-3 w-3" />
                          Mark Answered
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-muted-foreground"
                        aria-label="Edit prayer"
                        onClick={() => {
                          setEditingId(prayer._id);
                          setEditRequest(prayer.request);
                          setEditCategory(prayer.category);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-muted-foreground"
                        aria-label="Delete prayer"
                        onClick={() => { removePrayer({ id: prayer._id }).catch(() => {}); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
