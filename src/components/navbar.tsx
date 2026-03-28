"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Book, Search, BookMarked, Menu, User, LogOut, Home, BarChart3, Bookmark, PenLine, Sparkles, LayoutDashboard, HandHeart } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { FontSizeControl } from "@/components/font-size-control";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/bible", label: "Read", icon: Book },
  { href: "/verse-of-the-day", label: "Daily Verse", icon: Sparkles },
  { href: "/search", label: "Search", icon: Search },
  { href: "/plans", label: "Plans", icon: BookMarked },
];

const authLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/journal", label: "Journal", icon: PenLine },
  { href: "/prayers", label: "Prayers", icon: HandHeart },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useClerk();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 mx-auto max-w-6xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-heading">
          <Image
            src="/icons/icon-192.png"
            alt="Divine Word"
            width={28}
            height={28}
            className="rounded-sm"
          />
          <span className="font-semibold tracking-tight text-lg hidden sm:inline">
            Divine Word
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} aria-current={isActive ? "page" : undefined}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2 text-sm",
                    isActive && "font-medium"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
          {isAuthenticated &&
            authLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href} aria-current={isActive ? "page" : undefined}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("gap-2 text-sm", isActive && "font-medium")}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-1">
          <div className="hidden sm:flex">
            <FontSizeControl />
          </div>
          <ThemeToggle />
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex">
                <User className="h-4 w-4" />
                <span className="sr-only">Dashboard</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <User className="h-4 w-4" />
                <span className="sr-only">Sign in</span>
              </Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" />}
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-heading text-lg mb-6 flex items-center gap-2">
                <Image
                  src="/icons/icon-192.png"
                  alt="Divine Word"
                  width={24}
                  height={24}
                  className="rounded-sm"
                />
                Divine Word
              </SheetTitle>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <Link key={link.href} href={link.href} aria-current={isActive ? "page" : undefined}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3"
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}
                {isAuthenticated &&
                  authLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link key={link.href} href={link.href} aria-current={isActive ? "page" : undefined}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start gap-3"
                        >
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </Button>
                      </Link>
                    );
                  })}
              </nav>
              {isAuthenticated && (
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-600"
                    onClick={() => void signOut()}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Font Size</p>
                <FontSizeControl />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
