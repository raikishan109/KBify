// PWA Service Worker for KBify
const CACHE_NAME = 'kbify-v1.1';
const ASSETS = [
    './',
    './index.html',
    './css/main.css',
    './js/main.js',
    './js/state.js',
    './js/theme.js',
    './js/sidebar.js',
    './js/navigation.js',
    './js/components/Modal.js',
    './js/tools/common.js',
    './js/tools/registry.js',
    './js/tools/image/compressor.js',
    './js/tools/pdf/compressor.js',
    './js/utils/ui-utils.js',
    './js/utils/file-utils.js',
    './assets/logo.svg',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js'
];

// Install Event
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// Activate Event
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim()) // Claim control immediately
    );
});

// Fetch Event (Network-First Strategy)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).catch(() => {
            return caches.match(e.request);
        })
    );
});
