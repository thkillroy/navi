// MICHI-SHIRUBE サービスワーカー
// アプリ本体は常に最新を取りに行く（キャッシュで古い版が出ないように）。
// アイコンなど変わらないファイルだけキャッシュする。
const CACHE = 'michi-static-v1';
const STATIC = [
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // 自分のサイトのアイコン類だけキャッシュから返す
  if (url.origin === location.origin && STATIC.some(p => url.pathname.endsWith(p.replace('./','')))) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
    return;
  }
  // それ以外（アプリ本体・地図・Supabase）は毎回ネットワークへ
});
