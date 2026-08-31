"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Share2,
  ImageDown,
  StickyNote,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HIGHLIGHT_COLORS } from "@/lib/bible-data";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: string;
  text: string;
  /** Auth-only actions are hidden for signed-out readers. */
  showAuthActions: boolean;
  highlightColor: string | null;
  note: string | null;
  isBookmarked: boolean;
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
  onShareImage: () => void;
  onHighlight: (color: string | null) => void;
  onNote: (note: string) => void;
  onBookmark: () => void;
};

/**
 * Verse actions for touch.
 *
 * The reader's desktop toolbar is hover-only, which touch has no equivalent
 * for — and while it sat in the layout flow it took 156px off the reading
 * column of every verse. On small screens it is out of the layout entirely and
 * these actions open on tap instead, at full size.
 */
export function VerseActionsSheet({
  open,
  onOpenChange,
  reference,
  text,
  showAuthActions,
  highlightColor,
  note,
  isBookmarked,
  copied,
  onCopy,
  onShare,
  onShareImage,
  onHighlight,
  onNote,
  onBookmark,
}: Props) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  const startNote = () => {
    setNoteText(note ?? "");
    setEditingNote(true);
  };

  const saveNote = () => {
    onNote(noteText);
    setEditingNote(false);
  };

  const close = () => {
    setEditingNote(false);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setEditingNote(false);
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {/* Grab handle */}
        <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-border" />

        <div className="px-4 pb-1">
          <SheetTitle className="text-primary font-mono text-xs tracking-wide">
            {reference}
          </SheetTitle>
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {text}
          </p>
        </div>

        {editingNote ? (
          <div className="flex flex-col gap-3 px-4 pb-4">
            <Textarea
              autoFocus
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="A thought on this verse…"
              aria-label={`Note on ${reference}`}
            />
            <div className="flex gap-2">
              <Button className="h-11 flex-1" onClick={saveNote}>
                Save note
              </Button>
              <Button
                variant="outline"
                className="h-11 flex-1"
                onClick={() => setEditingNote(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 px-2 pb-2">
            {showAuthActions && (
              <div className="px-2 py-2.5">
                <p className="mb-2.5 font-mono text-[0.625rem] tracking-[0.12em] text-muted-foreground uppercase">
                  Highlight
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  {HIGHLIGHT_COLORS.map((color) => {
                    const active = highlightColor === color.value;
                    return (
                      <button
                        key={color.value}
                        type="button"
                        aria-label={`Highlight ${color.name}`}
                        aria-pressed={active}
                        onClick={() => onHighlight(active ? null : color.value)}
                        className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform ${
                            active ? "scale-110 border-foreground" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.value }}
                        >
                          {active && <Check className="h-4 w-4 text-foreground/70" />}
                        </span>
                      </button>
                    );
                  })}
                  {highlightColor && (
                    <button
                      type="button"
                      aria-label="Remove highlight"
                      onClick={() => onHighlight(null)}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <ActionRow
              icon={copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              label={copied ? "Copied" : "Copy verse"}
              onClick={onCopy}
            />

            {showAuthActions && (
              <>
                <ActionRow
                  icon={
                    isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )
                  }
                  label={isBookmarked ? "Remove bookmark" : "Bookmark"}
                  onClick={onBookmark}
                />
                <ActionRow
                  icon={<StickyNote className="h-4 w-4" />}
                  label={note ? "Edit note" : "Add a note"}
                  onClick={startNote}
                />
              </>
            )}

            <ActionRow
              icon={<Share2 className="h-4 w-4" />}
              label="Share"
              onClick={onShare}
            />
            <ActionRow
              icon={<ImageDown className="h-4 w-4" />}
              label="Share as image"
              onClick={onShareImage}
            />

            <Button variant="ghost" className="mt-1 h-11" onClick={close}>
              Close
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ActionRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-[0.9375rem] transition-colors hover:bg-muted active:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </button>
  );
}
