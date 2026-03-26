"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TRANSLATIONS = [
  { value: "KJV", label: "KJV", available: true },
  { value: "WEB", label: "WEB", available: false },
  { value: "ASV", label: "ASV", available: false },
] as const;

export function TranslationSwitcher() {
  return (
    <Select defaultValue="KJV">
      <SelectTrigger size="sm" className="w-auto gap-1.5 text-xs font-mono">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {TRANSLATIONS.map((t) => (
          <SelectItem key={t.value} value={t.value} disabled={!t.available}>
            {t.label}
            {!t.available && (
              <span className="ml-1 text-muted-foreground text-[10px]">
                soon
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
