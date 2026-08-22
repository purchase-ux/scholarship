"use client";

import { useEffect, useState } from "react";
import { subscribeToPush, unsubscribeFromPush } from "@/app/admin/(dashboard)/actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

type Status = "unsupported" | "loading" | "off" | "on" | "denied";

export function PushNotificationToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  async function checkStatus() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    setStatus(sub ? "on" : "off");
  }

  useEffect(() => {
    // One-time check of browser support and any existing subscription on
    // mount — genuinely can't be known during render (needs browser APIs
    // unavailable during SSR and an async registration lookup).
    async function run() {
      await checkStatus();
    }
    run();
  }, []);

  async function enable() {
    setError(null);
    setStatus("loading");
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error("Push notifications aren't configured for this deployment yet.");
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = subscription.toJSON();
      await subscribeToPush({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
      setStatus("on");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enable notifications.");
      setStatus("off");
    }
  }

  async function disable() {
    setError(null);
    setStatus("loading");
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        // Revoke the browser-level subscription FIRST. If that succeeds,
        // notifications are genuinely off regardless of what happens next,
        // so report "off" immediately. Only then try to delete the
        // server-side row — if that fails, it's not user-visible: push.ts
        // already cleans up dead subscriptions (404/410) on the next send.
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        setStatus("off");
        try {
          await unsubscribeFromPush(endpoint);
        } catch {
          // Non-fatal — self-heals via dead-subscription cleanup server-side.
        }
      } else {
        setStatus("off");
      }
    } catch {
      setStatus("on");
    }
  }

  if (status === "unsupported") return null;

  if (status === "denied") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Notifications blocked — how to fix
        </button>

        {showHelp && (
          <div className="fixed left-4 right-4 top-20 z-50 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-[var(--shadow-elevated-lg)] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
            <p className="text-xs font-semibold text-slate-800">
              Your browser is blocking notifications for this site
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              Once blocked, no website — including this one — can turn it back
              on automatically. You&rsquo;ll need to allow it from your
              browser&rsquo;s own settings, then come back here.
            </p>
            <ol className="mt-2.5 list-decimal space-y-1.5 pl-4 text-xs text-slate-600">
              <li>
                Click the icon just to the left of the address bar (a lock or
                info/tune icon)
              </li>
              <li>Find &ldquo;Notifications&rdquo; and change it to &ldquo;Allow&rdquo;</li>
              <li>Reload this page</li>
            </ol>
            <p className="mt-2 text-[11px] text-slate-400">
              On iPhone/Android: check Settings → Site settings/Permissions →
              Notifications for this site instead.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  // A real reload is the only thing that reliably works
                  // across browsers — some browsers keep reporting the old
                  // Notification.permission value in an already-loaded page
                  // even after the user changes it in site settings, so an
                  // in-place re-check alone can leave this button doing
                  // nothing with no explanation.
                  window.location.reload();
                }}
                className="rounded-full bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800"
              >
                I&rsquo;ve allowed it — reload to check
              </button>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={status === "on" ? disable : enable}
        disabled={status === "loading"}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          status === "on"
            ? "border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100"
            : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${status === "on" ? "bg-brand-500" : "bg-slate-300"}`} />
        {status === "loading" ? "…" : status === "on" ? "Notifications on" : "Enable notifications"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
