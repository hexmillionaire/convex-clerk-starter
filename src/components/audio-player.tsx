"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Play, Pause, Square, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AudioPlayerProps = {
  verses: { verse: number; text: string }[];
  bookName: string;
  chapter: number;
  onVerseChange?: (verse: number) => void;
};

export function AudioPlayer({ verses, bookName, chapter, onVerseChange }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [rate, setRate] = useState("1");
  const [expanded, setExpanded] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const verseIndexRef = useRef(0);
  const playingRef = useRef(false);
  const speakVerseRef = useRef<(index: number) => void | null>(null);

  // Cleanup on unmount or chapter change
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      playingRef.current = false;
    };
  }, [bookName, chapter]);

  const speakVerse = useCallback(
    (index: number) => {
      if (index >= verses.length) {
        setPlaying(false);
        playingRef.current = false;
        setCurrentVerse(0);
        verseIndexRef.current = 0;
        return;
      }

      const v = verses[index];
      const utt = new SpeechSynthesisUtterance(v.text);
      utt.rate = parseFloat(rate);
      utt.onend = () => {
        if (playingRef.current) {
          const next = verseIndexRef.current + 1;
          verseIndexRef.current = next;
          setCurrentVerse(next);
          onVerseChange?.(verses[next]?.verse ?? 0);
          speakVerseRef.current?.(next);
        }
      };
      utt.onerror = () => {
        setPlaying(false);
        playingRef.current = false;
      };
      utteranceRef.current = utt;
      setCurrentVerse(index);
      onVerseChange?.(v.verse);

      // Scroll to the verse
      const el = document.getElementById(`v${v.verse}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });

      speechSynthesis.speak(utt);
    },
    [verses, rate, onVerseChange]
  );

  useEffect(() => {
    speakVerseRef.current = speakVerse;
  }, [speakVerse]);

  const handlePlay = useCallback(() => {
    if (playing) {
      // Pause
      speechSynthesis.pause();
      setPlaying(false);
      playingRef.current = false;
      return;
    }

    // Resume if paused
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setPlaying(true);
      playingRef.current = true;
      return;
    }

    // Start fresh
    speechSynthesis.cancel();
    setPlaying(true);
    playingRef.current = true;
    speakVerse(verseIndexRef.current);
  }, [playing, speakVerse]);

  const handleStop = useCallback(() => {
    speechSynthesis.cancel();
    setPlaying(false);
    playingRef.current = false;
    setCurrentVerse(0);
    verseIndexRef.current = 0;
  }, []);

  const handlePrev = useCallback(() => {
    if (verseIndexRef.current > 0) {
      speechSynthesis.cancel();
      const prev = verseIndexRef.current - 1;
      verseIndexRef.current = prev;
      setCurrentVerse(prev);
      if (playingRef.current) {
        speakVerse(prev);
      }
    }
  }, [speakVerse]);

  const handleNext = useCallback(() => {
    if (verseIndexRef.current < verses.length - 1) {
      speechSynthesis.cancel();
      const next = verseIndexRef.current + 1;
      verseIndexRef.current = next;
      setCurrentVerse(next);
      if (playingRef.current) {
        speakVerse(next);
      }
    }
  }, [verses.length, speakVerse]);

  const handleRateChange = useCallback(
    (val: string | null) => {
      if (!val) return;
      setRate(val);
      // If currently playing, restart current verse with new rate
      if (playingRef.current) {
        speechSynthesis.cancel();
        // Small delay to let cancel finish
        setTimeout(() => speakVerse(verseIndexRef.current), 50);
      }
    },
    [speakVerse]
  );

  if (verses.length === 0) return null;

  const progress = verses.length > 0 ? Math.round((currentVerse / verses.length) * 100) : 0;

  return (
    <div className="border rounded-lg bg-card p-3">
      {/* Collapsed: just a listen button */}
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <Volume2 className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-wider">
            Listen to {bookName} {chapter}
          </span>
        </button>
      ) : (
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                {bookName} {chapter}
              </span>
            </div>
            <button
              onClick={() => {
                handleStop();
                setExpanded(false);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev} disabled={currentVerse === 0}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button variant="default" size="icon" className="h-9 w-9 rounded-full" onClick={handlePlay}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleStop}>
                <Square className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext} disabled={currentVerse >= verses.length - 1}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-mono">
                v{verses[currentVerse]?.verse ?? 1}
                <span className="text-muted-foreground/50"> / {verses[verses.length - 1]?.verse}</span>
              </span>
              <Select value={rate} onValueChange={handleRateChange}>
                <SelectTrigger className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5×</SelectItem>
                  <SelectItem value="0.75">0.75×</SelectItem>
                  <SelectItem value="1">1×</SelectItem>
                  <SelectItem value="1.25">1.25×</SelectItem>
                  <SelectItem value="1.5">1.5×</SelectItem>
                  <SelectItem value="2">2×</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
