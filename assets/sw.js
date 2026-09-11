// Basic PWA Service Worker for Cotufas System
const CACHE_NAME = 'cotufas-system-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle requests directly
  return;
});
