// 比前一版多一個新名字，確保舊 cache 被清掉
const CACHE_NAME = "trip-planner-v2";
const OFFLINE_URL = "/index.html";

// 安裝：只預先存 offline 頁面
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL]))
  );
  self.skipWaiting();
});

// 啟用：把舊版本 cache 刪掉
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

// 抓資料：
// 只有「導覽請求」（你打開頁面 / 切換 route）才攔截
// 正常情況全部走網路，失敗才回離線頁面
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)));
  }
});
