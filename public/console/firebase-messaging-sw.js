// https://firebase.google.com/docs/cloud-messaging/js/receive?hl=ja#web-modular-api_3
// 注: 通知がクリックされたときに行われるカスタム動作を Service Worker で定義する場合は、FCM 関数またはライブラリをインポートする前に notificationclick を処理してください。そうしないと、FCM はカスタム動作を上書きすることがあります。
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const baseURL = self.location.origin;
  const path = event.notification.data.FCM_MSG.data.path || '/';

  try {
    const url = new URL(path, baseURL).toString();  
    clients.openWindow(url);
  } catch (e) {
    console.error('Invalid URL:', url);
  }
});

// https://firebase.google.com/docs/cloud-messaging/js/receive?hl=ja
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');
importScripts('/console/firebase-config.js');

firebase.initializeApp(self.firebaseConfig);

const messaging = firebase.messaging();