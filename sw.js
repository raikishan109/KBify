const CACHE_NAME = 'kbify-v1.5';
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
    './js/tools/pdf/editor.js',
    './js/tools/pdf/viewer.js',
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

// Activate Event - Thorough cache clearing
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('Clearing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event (Network-First Strategy with safety checks)
self.addEventListener('fetch', (e) => {
    // Skip non-GET requests and non-http/https schemes
    if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) {
        return;
    }

    e.respondWith(
        fetch(e.request)
            .then((res) => {
                // Only cache valid responses
                if (res && res.status === 200 && res.type === 'basic') {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, clone).catch(err => {
                            // Silently ignore cache write errors
                        });
                    });
                }
                return res;
            })
            .catch(() => {
                return caches.match(e.request);
            })
    );
});
