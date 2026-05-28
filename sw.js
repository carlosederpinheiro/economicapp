const CACHE_NAME = 'exec-pro-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './inicio.html',
  './supabase.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalação do Service Worker e Cache dos ficheiros iniciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Ficheiros guardados em cache com sucesso.');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('A limpar cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Intercetador de requisições (Fetch)
self.addEventListener('fetch', (event) => {
  // Para requisições do Supabase (API), não queremos usar cache local rígido
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // Para os ficheiros da interface (HTML, JS, CSS, JSON, PNG), servimos do cache se houver
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Lidar com o recebimento do Push Notification
self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || '/icone192.png',
        badge: '/icone192.png',
        vibrate: [100, 50, 100],
        data: {
          url: data.url || '/'
        }
      };
      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    } catch (e) {
      console.error("Erro ao fazer parse do push payload", e);
    }
  }
});

// Lidar com o clique na Notificação
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Se já houver uma aba aberta com o app, foca nela
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});