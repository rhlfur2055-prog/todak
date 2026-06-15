// 토닥 서비스워커 — 앱 셸 오프라인 캐싱 (PWA)
// 모든 계산이 클라이언트라 한 번 방문하면 오프라인에서도 위로/사주가 동작한다.
// (관상 모델은 외부 CDN이라 첫 분석엔 네트워크 필요 — 그건 캐싱하지 않는다.)
const CACHE = "todak-v1";
const SHELL = ["/", "/app", "/check", "/face", "/report", "/help", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // CDN 등 외부는 그대로 통과

  // 네트워크 우선 + 캐시 폴백 (오프라인이면 캐시, 그래도 없으면 홈)
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((m) => m || caches.match("/")))
  );
});
