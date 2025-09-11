'use client';

import { useEffect, useRef, useState } from 'react';
import { isSupported, getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { firebaseApp } from '@/lib/firebase';

export default function FcmClient() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default'); // SSRでは'default'
  const [token, setToken] = useState<string>('');
  const [lastMsg, setLastMsg] = useState<MessagePayload | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const swRegRef = useRef<ServiceWorkerRegistration | null>(null);

  // クライアントでのみブラウザAPIに触る
  useEffect(() => {
    let mounted = true;
    (async () => {
      const ok = await isSupported().catch(() => false);
      if (!mounted) return;
      setSupported(ok);

      if (typeof Notification !== 'undefined') {
        setPermission(Notification.permission);
      }

      if (!ok || !('serviceWorker' in navigator)) return;

      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
      swRegRef.current = reg;
    })();
    return () => { mounted = false; };
  }, []);

  // フォアグラウンド受信
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      if (!(await isSupported())) return;
      const messaging = getMessaging(firebaseApp);
      unsub = onMessage(messaging, (payload) => {
        setLastMsg(payload);
        // eslint-disable-next-line no-console
        console.log('onMessage:', payload);
      });
    })();
    return () => unsub();
  }, []);

  // 明示操作で許可→トークン取得
  const requestAndGetToken = async () => {
    setErrorMsg('');

    if (!(await isSupported())) {
      setErrorMsg('このブラウザは FCM の Web Push に対応していません。');
      return;
    }

    if (typeof Notification === 'undefined') {
      setErrorMsg('この環境では通知APIが利用できません。');
      return;
    }

    const p = await Notification.requestPermission();
    setPermission(p);
    if (p !== 'granted') {
      if (p === 'denied') {
        setErrorMsg('通知がブロックされています。ブラウザのサイト設定から通知を許可してください。');
      }
      return;
    }

    try {
      const reg = swRegRef.current ?? (await navigator.serviceWorker.ready);
      const messaging = getMessaging(firebaseApp);
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;
      const t = await getToken(messaging, { vapidKey, serviceWorkerRegistration: reg });
      if (t) setToken(t);
    } catch (e) {
      console.error('getToken failed:', e);
      setErrorMsg('トークン取得に失敗しました。ページを再読み込みして再試行してください。');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Web Push を有効化</h2>

      {/* 許可未付与のときだけ出すボタン */}
      {permission !== 'granted' && (
        <button
          className="rounded px-3 py-2 border"
          onClick={requestAndGetToken}
          disabled={supported === false}
        >
          通知を有効化（許可をリクエスト）
        </button>
      )}

      {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

      {/* 許可済み→トークン表示 */}
      {token && (
        <div>
          <p className="font-medium">登録トークン（FCMコンソールのテスト送信に使用）</p>
          <textarea readOnly className="w-full h-32 p-2 border rounded" value={token} />
        </div>
      )}

      {lastMsg && (
        <div className="border rounded p-3">
          <p className="font-medium">フォアグラウンドで受信したメッセージ</p>
          <pre className="text-sm overflow-auto">{JSON.stringify(lastMsg, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
