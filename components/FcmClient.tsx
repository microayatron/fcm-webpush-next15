'use client';

import { useEffect, useRef, useState } from 'react';
import { isSupported, getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { firebaseApp } from '@/lib/firebase';
import styles from './FcmClient.module.css';

export default function FcmClient() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string>('');
  const [lastMsg, setLastMsg] = useState<MessagePayload | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const swRegRef = useRef<ServiceWorkerRegistration | null>(null);

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

      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      swRegRef.current = reg;
    })();
    return () => { mounted = false; };
  }, []);

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

  const fetchToken = async () => {
    setErrorMsg('');
    setIsFetchingToken(true);
    try {
      if (!(await isSupported())) {
        setErrorMsg('このブラウザは FCM の Web Push に対応していません。');
        return;
      }
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_WEBPUSH_KEY!;
      if (!vapidKey) {
        setErrorMsg('VAPID 公開鍵が未設定です。NEXT_PUBLIC_FIREBASE_WEBPUSH_KEY を確認してください。');
        return;
      }
      const reg = swRegRef.current ?? (await navigator.serviceWorker.ready);
      const messaging = getMessaging(firebaseApp);
      const t = await getToken(messaging, { vapidKey, serviceWorkerRegistration: reg });
      if (t) setToken(t);
    } catch (e) {
      console.error('getToken failed:', e);
      setErrorMsg('トークン取得に失敗しました。ページを再読み込みして再試行してください。');
    } finally {
      setIsFetchingToken(false);
    }
  };

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
      if (p === 'denied') setErrorMsg('通知がブロックされています。ブラウザのサイト設定から通知を許可してください。');
      return;
    }
    await fetchToken();
  };

  useEffect(() => {
    if (supported && permission === 'granted' && !token && !isFetchingToken) {
      void fetchToken();
    }
  }, [supported, permission, token, isFetchingToken]);

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <section className={styles.wrap}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 className={styles.title}>Web Push を有効化</h2>
          <p className={styles.desc}>FCM コンソールからの配信テストに使う登録トークンを取得します。</p>
          <div className={styles.badges}>
            <span
              className={`${styles.chip} ${supported === false ? styles.chipNg : styles.chipOk}`}
            >
              {supported === false ? '未対応ブラウザ' : 'FCM対応環境'}
            </span>
            <span className={`${styles.chip} ${styles.chipMuted}`}>
              通知許可状態: {permission}
            </span>
          </div>
        </header>

        {permission !== 'granted' && (
          <button
            className={`${styles.btn} ${isFetchingToken ? styles.btnDisabled : ''}`}
            onClick={requestAndGetToken}
            disabled={supported === false || isFetchingToken}
          >
            {isFetchingToken ? '処理中…' : '通知を有効化（許可をリクエスト）'}
          </button>
        )}

        {errorMsg && <p className={styles.error}>{errorMsg}</p>}

        {isFetchingToken && !token && <p className={styles.muted}>トークン取得中…</p>}

        {token && (
          <div className={styles.tokenBlock}>
            <label className={styles.label}>登録トークン（FCM コンソールのテスト送信に使用）</label>
            <div className={styles.tokenRow}>
              <textarea readOnly className={styles.textarea} value={token} />
              <button className={styles.btnGhost} onClick={copyToken}>
                {copied ? 'コピー済み' : 'コピー'}
              </button>
            </div>
          </div>
        )}

        {lastMsg && (
          <details className={styles.details}>
            <summary className={styles.summary}>フォアグラウンドで受信したメッセージ</summary>
            <pre className={styles.pre}>{JSON.stringify(lastMsg, null, 2)}</pre>
          </details>
        )}
      </div>
    </section>
  );
}
