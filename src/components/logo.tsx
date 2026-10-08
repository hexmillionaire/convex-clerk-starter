import { cn } from "@/lib/utils";

/**
 * Inline so it inherits `currentColor` and needs no image request. Replace
 * the path with your own mark; keep the viewBox square so the navbar and
 * tab bar sizing holds.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("text-primary", className)}
      fill="none"
    >
      <rect x="2" y="2" width="28" height="28" rx="8" className="fill-current" />
      <path
        d="M18.5 7 10 18h5.5L13.5 25 22 14h-5.5z"
        className="fill-background"
        strokeLinejoin="round"
      />
    </svg>
  );
}
