"use client";

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

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/50 bg-background/80 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
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
