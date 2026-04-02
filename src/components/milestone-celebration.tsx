"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const CONFETTI_COLORS = ["#c9972b", "#e8c96a", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];
// Pre-computed confetti positions to avoid Math.random during render
const CONFETTI_POSITIONS = Array.from({ length: 24 }, (_, i) => ({
  left: `${(((i * 17 + 7) * 13) % 100)}%`,
  delay: `${((i * 7 + 3) % 10) / 20}s`,
  color: CONFETTI_COLORS[i % 7],
}));

function ConfettiParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {CONFETTI_POSITIONS.map((p, i) => (
        <div
          key={i}
          className="confetti-particle"
          style={{
            left: p.left,
            animationDelay: p.delay,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}

const MILESTONE_LABELS: Record<string, (v: number) => string> = {
  chapters_read: (v) => `${v} Chapter${v > 1 ? "s" : ""} Read`,
  streak: (v) => `${v}-Day Streak`,
  books_completed: (v) => `${v} Book${v > 1 ? "s" : ""} Completed`,
  bookmarks: (v) => `${v} Bookmark${v > 1 ? "s" : ""} Saved`,
  journal_entries: (v) => `${v} Journal Entr${v > 1 ? "ies" : "y"} Written`,
};

const MILESTONE_EMOJI: Record<string, string> = {
  chapters_read: "📖",
  streak: "🔥",
  books_completed: "📚",
  bookmarks: "🔖",
  journal_entries: "✍️",
};

type Milestone = {
  _id: Id<"milestones">;
  type: string;
  value: number;
};

type Props = {
  milestones: Milestone[];
};

/**
 * Duolingo-style celebration modal that slides up when there are
 * uncelebrated milestones. Shows confetti particles + trophy icon.
 */
export function MilestoneCelebration({ milestones }: Props) {
  const celebrate = useMutation(api.milestones.celebrate);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(false);

  // Derive current milestone from props (no setState effects needed)
  const remaining = milestones.filter((m) => !dismissed.has(m._id));
  const current = remaining[0] ?? null;

  useEffect(() => {
    if (current) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [current?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDismiss = useCallback(async () => {
    if (!current) return;
    setVisible(false);
    try {
      await celebrate({ id: current._id });
    } catch { /* ignore */ }
    // Wait for exit animation, then mark dismissed
    setTimeout(() => {
      setDismissed((prev) => new Set(prev).add(current._id));
      setVisible(false);
    }, 300);
  }, [current, celebrate]);

  if (!current) return null;

  const label = MILESTONE_LABELS[current.type]?.(current.value) ?? `${current.type}: ${current.value}`;
  const emoji = MILESTONE_EMOJI[current.type] ?? "🏆";

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-400",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleDismiss}
      />

      {/* Confetti particles */}
      {visible && <ConfettiParticles />}

      {/* Modal */}
      <div
        className={cn(
          "relative bg-card border border-primary/15 rounded-3xl shadow-2xl max-w-sm w-full p-10 text-center transition-all duration-400",
          visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
        )}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors duration-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Trophy + emoji */}
        <div className="mb-5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4 animate-bounce-in">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <p className="text-4xl mb-1" role="img" aria-label="celebration">{emoji}</p>
        </div>

        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary mb-3">
          Milestone Reached
        </p>
        <h3 className="text-2xl font-heading font-bold mb-3 tracking-tight">{label}</h3>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Keep up the incredible work!
        </p>

        <Button onClick={handleDismiss} className="w-full gap-2.5 h-12 rounded-full text-base">
          <span className="text-lg">🎉</span> Continue
        </Button>

        {remaining.length > 1 && (
          <p className="text-[10px] text-muted-foreground mt-3 font-mono">
            +{remaining.length - 1} more milestone{remaining.length > 2 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
