// メシ活 Service Worker（通知用・キャッシュはしない）
// ※ 端末が閉じている間のスケジュール配信にはプッシュサーバ(VAPID)が必要。
//    本SWは通知の表示とクリック時のアプリ復帰を担う最小実装。

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// 通知クリックでアプリを前面に
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const url = event.notification.data?.url || "/fridge";
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
