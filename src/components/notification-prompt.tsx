"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";

const DISMISSED_KEY = "dw-notif-prompt-dismissed";
const VAPID_PUBLIC_KEY = "BJzz7W8WIXsVilkUyZmMlo5e1BbnIGNiWaUnH5S2xq-DwQY1A1ZXOfZv43sEKGHkbJWYBQ4fs0oOHFxNmQzhay8";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
  return arr;
}

/**
 * Gentle notification opt-in prompt. Appears once per session,
 * dismissible, won't show again for 7 days after dismiss.
 * Only shows if browser supports notifications and permission is "default".
 */
export function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const { isAuthenticated } = useConvexAuth();
  const saveSubscription = useMutation(api.pushSubscriptions.save);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    const timer = setTimeout(() => setShow(true), 10000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setShow(false);
  }

  async function handleEnable() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Subscribe to push notifications via service worker
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // Save subscription to Convex
        if (isAuthenticated) {
          const json = subscription.toJSON();
          if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
            await saveSubscription({
              endpoint: json.endpoint,
              keys: {
                p256dh: json.keys.p256dh,
                auth: json.keys.auth,
              },
            });
          }
        }

        // Show confirmation
        new Notification("Divine Word", {
          body: "You'll receive daily verses and streak reminders!",
          icon: "/icons/icon-192.png",
        });
      }
    } catch {
      // Permission denied or service worker unavailable
    }
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
              Get daily verses & streak reminders
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
