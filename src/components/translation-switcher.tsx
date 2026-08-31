"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TRANSLATIONS, type Translation } from "@/lib/bible-data";

export type { Translation };

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
          <SelectItem key={t} value={t}>
            {t}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
