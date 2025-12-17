const CACHE_NAME = 'biblia-iasd-media-v14';

// Lista completa de recursos para salvar na memória interna (Cache)
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap',
  
  // --- IMAGENS E TEXTURAS ---
  'https://www.transparenttextures.com/patterns/black-linen.png',
  'https://cdn-icons-png.flaticon.com/512/3004/3004458.png',
  'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=1920&auto=format&fit=crop', // Leão
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1920&auto=format&fit=crop', // Cruz
  'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?q=80&w=1080&h=1920&auto=format&fit=crop', // Screenshot 1
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1280&h=720&auto=format&fit=crop', // Screenshot 2

  // --- EFEITOS SONOROS (SFX) ---
  'https://cdn.pixabay.com/audio/2022/10/23/audio_17df663552.mp3', // Rugido do Leão
  'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Quiz Correto
  'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3', // Quiz Errado
  'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3', // Quiz Tick
  'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3',   // Quiz Timeout

  // --- HINOS E MÚSICAS ---
  'https://archive.org/download/hino-43-castelo-forte-hinario-adventista/Hino%2043%20-%20Castelo%20Forte%20-%20Hin%C3%A1rio%20Adventista.mp3',
  'https://archive.org/download/Hino16SantoSantoSanto/Hino%2016%20-%20Santo%21%20Santo%21%20Santo%21.mp3',
  'https://archive.org/download/Hino34GrandiosoEsTu/Hino%2034%20-%20Grandioso%20%C3%A9s%20Tu.mp3',
  'https://cdn.pixabay.com/audio/2022/06/17/audio_651a5477d6.mp3', // Amazing Grace
  'https://archive.org/download/harpa-crista-hino-545-porque-ele-vive/Harpa%20Crist%C3%A3%20-%20Hino%20545%20-%20Porque%20Ele%20Vive.mp3',
  'https://archive.org/download/HarpaCristaHino291ARudeCruz/Harpa%20Crist%C3%A3%20-%20Hino%20291%20-%20A%20Rude%20Cruz.mp3'
];

self.addEventListener('install', (event) => {
  // Força o download de TODOS os assets listados para a memória interna
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Salvando mídia na memória interna...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Limpando cache antigo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições POST ou APIs externas dinâmicas (como Gemini AI)
  if (event.request.method !== 'GET' || event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // Estratégia de Cache-First para Mídia (Audio/Imagens) para evitar "corrupção" ou lag
  // Se for um arquivo de mídia ou imagem conhecido, tenta o cache primeiro
  const isMedia = event.request.url.endsWith('.mp3') || 
                  event.request.url.endsWith('.png') || 
                  event.request.url.endsWith('.jpg') ||
                  STATIC_ASSETS.includes(event.request.url);

  if (isMedia) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                // Se baixou da rede, salva no cache para a próxima vez
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'cors') { // 'basic' ou 'cors' para assets externos
                     const responseToCache = networkResponse.clone();
                     caches.open(CACHE_NAME).then((cache) => {
                         cache.put(event.request, responseToCache);
                     });
                }
                return networkResponse;
            });
        })
      );
  } else {
      // Estratégia Stale-While-Revalidate para o resto (HTML, JS, CSS do app)
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          }).catch(() => {
             // Fallback offline se necessário
          });
          return cachedResponse || fetchPromise;
        })
      );
  }
});