"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Book, Search, User, LogOut, Home, Bookmark, PenLine, LayoutDashboard, HandHeart, BarChart3, BookMarked } from "lucide-react";
import { useClerk, useUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/bible", label: "Read", icon: Book, match: (p: string) => p.startsWith("/bible") || p.startsWith("/search") },
  { href: "/journal", label: "Reflect", icon: PenLine, match: (p: string) => p.startsWith("/journal") || p.startsWith("/bookmarks") || p.startsWith("/prayers") },
  { href: "/dashboard", label: "Me", icon: User, match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/stats") || p.startsWith("/plans") || p.startsWith("/login") },
];

export function Navbar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const isAuthenticated = !!isSignedIn;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center px-6 mx-auto max-w-6xl gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-heading shrink-0">
          <Image
            src="/icons/icon-192.png"
            alt="Divine Word"
            width={30}
            height={30}
            className="rounded-lg"
          />
          <span className="font-semibold tracking-tight text-lg hidden sm:inline whitespace-nowrap">
            Divine Word
          </span>
        </Link>

        {/* Desktop nav — 4 primary tabs */}
        <nav className="hidden md:flex items-center gap-1 flex-1 min-w-0 justify-center">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.match(pathname);
            return (
              <Tooltip key={link.href}>
                <TooltipTrigger
                  render={
                    <Link href={link.href} aria-current={isActive ? "page" : undefined} aria-label={link.label}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className={cn("gap-2 h-9 px-4 text-xs font-mono uppercase tracking-[0.12em] rounded-full", isActive && "font-medium")}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {link.label}
                      </Button>
                    </Link>
                  }
                />
                <TooltipContent side="bottom">{link.label}</TooltipContent>
              </Tooltip>
            );
          })}

          {/* Quick access: Search */}
          <div className="mx-2 h-5 w-px bg-border/50" />
          <Tooltip>
            <TooltipTrigger
              render={
                <Link href="/search" aria-label="Search">
                  <Button variant={pathname.startsWith("/search") ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-full">
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              }
            />
            <TooltipContent side="bottom">Search</TooltipContent>
          </Tooltip>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          {/* Mobile search */}
          <Link href="/search" className="md:hidden" aria-label="Search">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <ThemeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex rounded-full" />}
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
                <Link href="/bookmarks">
                  <DropdownMenuItem className="gap-2">
                    <Bookmark className="h-4 w-4" />
                    Bookmarks
                  </DropdownMenuItem>
                </Link>
                <Link href="/journal">
                  <DropdownMenuItem className="gap-2">
                    <PenLine className="h-4 w-4" />
                    Journal
                  </DropdownMenuItem>
                </Link>
                <Link href="/prayers">
                  <DropdownMenuItem className="gap-2">
                    <HandHeart className="h-4 w-4" />
                    Prayers
                  </DropdownMenuItem>
                </Link>
                <Link href="/plans">
                  <DropdownMenuItem className="gap-2">
                    <BookMarked className="h-4 w-4" />
                    Plans
                  </DropdownMenuItem>
                </Link>
                <Link href="/stats">
                  <DropdownMenuItem className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Stats
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
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
        </div>
      </div>
    </header>
  );
}
