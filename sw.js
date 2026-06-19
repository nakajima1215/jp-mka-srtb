/* ===== sw.js – JP-M課 生産リアルタイムボード ===== */
const CACHE_NAME = 'seisan-board-v2';

/* インストール: キャッシュ不要ファイルは何も入れない（ネットワーク優先） */
self.addEventListener('install', event => {
  self.skipWaiting();
});

/* アクティベート: 古いキャッシュを全削除 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

/* フェッチ: ネットワーク優先、失敗時のみキャッシュ返却 */
self.addEventListener('fetch', event => {
  /* navigate リクエスト（ページ遷移）は必ずネットワークへ */
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then(r => r || new Response('', { status: 408 }))
      )
    );
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        /* 正常レスポンスをキャッシュに保存 */
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(r => r || new Response('', { status: 408 })))
  );
});
