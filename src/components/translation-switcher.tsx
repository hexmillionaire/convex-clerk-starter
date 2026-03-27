"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TRANSLATIONS = [
  { value: "KJV", label: "KJV" },
  { value: "WEB", label: "WEB" },
  { value: "ASV", label: "ASV" },
] as const;

export type Translation = (typeof TRANSLATIONS)[number]["value"];

export function TranslationSwitcher({
  value = "KJV",
  onChange,
}: {
  value?: Translation;
  onChange?: (t: Translation) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange?.(v as Translation)}>
      <SelectTrigger size="sm" className="w-auto gap-1.5 text-xs font-mono">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {TRANSLATIONS.map((t) => (
          <SelectItem key={t.value} value={t.value}>
            {t.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
