"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Book, PenLine, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/bible", label: "Read", icon: Book, match: (p: string) => p.startsWith("/bible") || p.startsWith("/search") },
  { href: "/journal", label: "Reflect", icon: PenLine, match: (p: string) => p.startsWith("/journal") || p.startsWith("/bookmarks") || p.startsWith("/prayers") },
  { href: "/dashboard", label: "Me", icon: User, match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/stats") || p.startsWith("/plans") || p.startsWith("/login") },
];

/** /bible/<book>/<chapter> — the reading view, where the bar gets out of the way. */
const CHAPTER_ROUTE = /^\/bible\/[^/]+\/\d+\/?$/;

/**
 * Hides the bar while the reader scrolls down a chapter and brings it back on
 * any upward scroll. Only on chapter routes: everywhere else the bar is
 * navigation, but over scripture it interrupts the column it sits on.
 *
 * The hidden state is keyed to the route that hid it, so navigating to the next
 * chapter brings the bar back without needing to reset anything.
 */
function useHideOnScroll(route: string | null) {
  const [hiddenFor, setHiddenFor] = useState<string | null>(null);

  useEffect(() => {
    if (!route) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lastY = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return; // coalesce to one read per frame
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - lastY;
        if (Math.abs(delta) < 6) return; // ignore jitter and rubber-banding
        lastY = y;
        setHiddenFor(delta > 0 && y > 120 ? route : null);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [route]);

  return route !== null && hiddenFor === route;
}

export function BottomTabBar() {
  const pathname = usePathname();
  const hidden = useHideOnScroll(CHAPTER_ROUTE.test(pathname) ? pathname : null);

  return (
    <nav
      aria-label="Primary"
      aria-hidden={hidden}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/50 bg-background/80 backdrop-blur-xl safe-area-bottom",
        "transition-transform duration-300 motion-reduce:transition-none",
        hidden ? "translate-y-full" : "translate-y-0"
      )}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              tabIndex={hidden ? -1 : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-full",
                "transition-colors duration-200 active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "stroke-[2.5px] scale-110")} />
              <span className="text-[10px] font-mono tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
