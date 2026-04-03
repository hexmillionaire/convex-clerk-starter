"use node";

import webPush from "web-push";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const sendToAll = internalAction({
  args: {
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("VAPID keys not configured");
      return { sent: 0, failed: 0 };
    }

    const vapidSubject = process.env.VAPID_SUBJECT ?? "mailto:notifications@divineword.app";
    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // Get all subscriptions
    const subs: Array<{
      _id: string;
      endpoint: string;
      keys: { p256dh: string; auth: string };
    }> = await ctx.runQuery(internal.pushNotifications.getAllSubscriptions);

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      url: args.url ?? "/",
      tag: args.tag ?? "divine-word",
    });

    let sent = 0;
    let failed = 0;
    const staleIds: string[] = [];

    for (const sub of subs) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload,
        );
        sent++;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 410 || statusCode === 404) {
          // Subscription expired or invalid — mark for removal
          staleIds.push(sub._id);
        }
        failed++;
      }
    }

    // Clean up stale subscriptions
    if (staleIds.length > 0) {
      await ctx.runMutation(internal.pushNotifications.removeStale, {
        ids: staleIds,
      });
    }

    console.log(
      `Push notifications: ${sent} sent, ${failed} failed, ${staleIds.length} removed`,
    );
    return { sent, failed };
  },
});
