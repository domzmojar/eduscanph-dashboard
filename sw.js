// sw.js — Service Worker for EduScan PH Admin Dashboard
// This file must be served from the ROOT of your domain

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Handle push events from Supabase Edge Function
self.addEventListener('push', event => {
  let data = { title: 'EduScan PH', body: 'New activity!' };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { title: parsed.title || data.title, body: parsed.body || data.body };
    }
  } catch(e) {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135810.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135810.png',
      vibrate: [200, 100, 200],
      tag: 'eduscan-admin',
      renotify: true,
      requireInteraction: false,
    })
  );
});

// Open dashboard when notification is tapped
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('admin') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/admin-dashboard.html');
    })
  );
});