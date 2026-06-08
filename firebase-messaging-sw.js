// firebase-messaging-sw.js
// Place this file at the ROOT of your web server (same level as index.html / eTask.html).
// It must be served from the root scope — /firebase-messaging-sw.js — not a subdirectory.

// ── Match the version used in your main app ───────────────────────────────────
importScripts('https://www.gstatic.com/firebasejs/11.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.8.0/firebase-messaging-compat.js');

// ── Same config as eTask.html ─────────────────────────────────────────────────
firebase.initializeApp({
  apiKey:            "AIzaSyAKulZ1Z5rklbYR4DPKGsqRyq9DWUCI0ms",
  authDomain:        "etask-1d4f2.firebaseapp.com",
  projectId:         "etask-1d4f2",
  storageBucket:     "etask-1d4f2.firebasestorage.app",
  messagingSenderId: "634781794809",
  appId:             "1:634781794809:web:e779543498e891bee17d28"
});

const messaging = firebase.messaging();

// ── Background message handler ────────────────────────────────────────────────
// Fires when a push arrives and the app tab is closed or in the background.
messaging.onBackgroundMessage(payload => {
  const data        = payload.data || {};
  const notif       = payload.notification || {};
  const title       = notif.title  || data.title  || 'eTask';
  const body        = notif.body   || data.body   || 'You have a new notification';
  const tag         = data.tag     || 'etask-general';   // same tag = replaces old notif
  const taskId      = data.taskId  || '';
  const url         = data.url     || '/';

  self.registration.showNotification(title, {
    body,
    icon:             '/etask-192.svg',
    badge:            '/etask-32.svg',
    tag,                              // replaces previous notif with same tag
    requireInteraction: true,         // stays until dismissed
    data:             { url, taskId },
    actions: [
      { action: 'view',    title: 'View task' },
      { action: 'dismiss', title: 'Dismiss'   }
    ]
  });
});

// ── Notification click handler ────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // If the app is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
