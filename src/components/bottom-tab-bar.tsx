"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/components/navbar";
import { cn } from "@/lib/utils";

/**
 * Mobile-only primary navigation. Hidden at `md` and up, where the navbar
 * carries the same links. `main` reserves space for it via
 * `--tabbar-clearance` in globals.css, so content never ends underneath it on
 * a notched phone.
 */
export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/50 bg-background/80 backdrop-blur-xl safe-area-bottom"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {NAV_LINKS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-20 h-full",
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
