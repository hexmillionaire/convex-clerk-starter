"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "dw-notif-prompt-dismissed";

/**
 * Gentle notification opt-in prompt. Appears once per session,
 * dismissible, won't show again for 7 days after dismiss.
 * Only shows if browser supports notifications and permission is "default".
 */
export function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only run client-side
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Delay showing by 10 seconds (don't interrupt first load)
    const timer = setTimeout(() => setShow(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setShow(false);
  }

  async function handleEnable() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Show a confirmation notification
        new Notification("Divine Word", {
          body: "You'll get gentle reminders to keep your streak alive!",
          icon: "/icons/icon-192.png",
        });
      }
    } catch { /* ignore */ }
    // Dismiss either way
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setShow(false);
  }

  if (!show) return null;

  return (
    <section className="pb-4 animate-slide-up">
      <div className="container max-w-2xl mx-auto px-6">
        <div className="flex items-center gap-4 rounded-2xl border bg-card px-5 py-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-heading font-semibold">
              Never miss a day
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get gentle reminders to keep your reading streak
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="default" className="h-8 text-xs px-4 rounded-full" onClick={handleEnable}>
              Enable
            </Button>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
