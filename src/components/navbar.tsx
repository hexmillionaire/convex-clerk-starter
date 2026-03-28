"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Book, Search, BookMarked, Menu, User, LogOut, Home, BarChart3, Bookmark, PenLine, Sparkles, LayoutDashboard, HandHeart } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { FontSizeControl } from "@/components/font-size-control";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const isAuthenticated = !!isSignedIn;
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center px-4 mx-auto max-w-6xl gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-heading shrink-0">
          <Image
            src="/icons/icon-192.png"
            alt="Divine Word"
            width={28}
            height={28}
            className="rounded-sm"
          />
          <span className="font-semibold tracking-tight text-lg hidden sm:inline whitespace-nowrap">
            Divine Word
          </span>
        </Link>

        {/* Desktop nav — icon-only with tooltips */}
        <nav className="hidden md:flex items-center gap-1 flex-1 min-w-0 justify-center">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Tooltip key={link.href}>
                <TooltipTrigger
                  render={
                    <Link href={link.href} aria-current={isActive ? "page" : undefined} aria-label={link.label}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="icon"
                        className={cn("h-9 w-9", isActive && "font-medium")}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    </Link>
                  }
                />
                <TooltipContent side="bottom">{link.label}</TooltipContent>
              </Tooltip>
            );
          })}

          {isAuthenticated && (
            <div className="mx-1 h-5 w-px bg-border" />
          )}

          {isAuthenticated &&
            authLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger
                    render={
                      <Link href={link.href} aria-current={isActive ? "page" : undefined} aria-label={link.label}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          size="icon"
                          className={cn("h-9 w-9", isActive && "font-medium")}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      </Link>
                    }
                  />
                  <TooltipContent side="bottom">{link.label}</TooltipContent>
                </Tooltip>
              );
            })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-0.5 shrink-0 ml-auto">
          <div className="hidden lg:flex">
            <FontSizeControl />
          </div>
          <ThemeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex" />}
              >
                <User className="h-4 w-4" />
                <span className="sr-only">Account</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/dashboard">
                  <DropdownMenuItem className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="gap-2"
                  variant="destructive"
                  onClick={() => void signOut()}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="hidden md:flex">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <User className="h-4 w-4" />
                <span className="sr-only">Sign in</span>
              </Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" />}
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 flex flex-col">
              <SheetTitle className="font-heading text-lg mb-4 flex items-center gap-2">
                <Image
                  src="/icons/icon-192.png"
                  alt="Divine Word"
                  width={24}
                  height={24}
                  className="rounded-sm"
                />
                Divine Word
              </SheetTitle>

              {/* Mobile nav links */}
              <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSheetOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                    >
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

                {/* Auth-gated links with separator */}
                {isAuthenticated && (
                  <>
                    <div className="my-2 border-t" />
                    <p className="text-xs text-muted-foreground px-3 mb-1 uppercase tracking-wider">
                      My Study
                    </p>
                    {authLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname.startsWith(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setSheetOpen(false)}
                          aria-current={isActive ? "page" : undefined}
                        >
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
                  </>
                )}
              </nav>

              {/* Bottom controls */}
              <div className="mt-auto border-t pt-4 space-y-4">
                {/* Theme */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Theme</p>
                  <ThemeToggle />
                </div>

                {/* Font size */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Font Size</p>
                  <FontSizeControl />
                </div>

                {/* Auth action */}
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-600"
                    onClick={() => {
                      setSheetOpen(false);
                      void signOut();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Link href="/login" onClick={() => setSheetOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <User className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
