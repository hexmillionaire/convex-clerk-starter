"use client";

import { useState } from "react";
import { Highlighter, X, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HIGHLIGHT_COLORS } from "@/lib/bible-data";

type Props = {
  verseId: string;
  currentColor?: string | null;
  currentNote?: string | null;
  onHighlight: (verseId: string, color: string | null) => void;
  onNote?: (verseId: string, note: string) => void;
};

export function HighlightPicker({
  verseId,
  currentColor,
  currentNote,
  onHighlight,
  onNote,
}: Props) {
  const [open, setOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(currentNote ?? "");

  const close = () => {
    setOpen(false);
    setEditingNote(false);
  };

  const startEditingNote = () => {
    setNoteText(currentNote ?? "");
    setEditingNote(true);
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <Highlighter
          className="h-3 w-3"
          style={currentColor ? { color: currentColor } : undefined}
        />
      </Button>

      {open && (
        <div
          className="absolute right-0 top-8 z-50 flex flex-col gap-1.5 rounded-lg border bg-popover p-1.5 shadow-md animate-in fade-in-0 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.value}
                className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                style={{
                  backgroundColor: c.value,
                  borderColor:
                    currentColor === c.value
                      ? "var(--foreground)"
                      : "transparent",
                }}
                title={c.name}
                onClick={(e) => {
                  e.stopPropagation();
                  onHighlight(verseId, c.value);
                  close();
                }}
              />
            ))}
            {currentColor && (
              <button
                className="ml-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
                title="Remove highlight"
                onClick={(e) => {
                  e.stopPropagation();
                  onHighlight(verseId, null);
                  close();
                }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Note editor — available once the verse is highlighted */}
          {onNote && currentColor && (
            editingNote ? (
              <div className="flex flex-col gap-1.5 w-48">
                <Textarea
                  autoFocus
                  rows={2}
                  className="text-xs min-h-0"
                  placeholder="Add a note…"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNote(false);
                      setNoteText(currentNote ?? "");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNote(verseId, noteText);
                      close();
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 justify-start text-xs text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditingNote();
                }}
              >
                <StickyNote className="h-3 w-3 mr-1" />
                {currentNote ? "Edit note" : "Add note"}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
