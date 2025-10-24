'use client';

import { useEffect, useRef, useState } from 'react';
import { isSupported, getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { firebaseApp } from '@/lib/firebase';
import { getErrorMessage } from '@/lib/constants';
import type { FCMClientProps, FCMClientState } from '@/lib/types';
import { createDebugger, printDebugInfo } from '@/lib/debug';
import styles from './FcmClient.module.css';

/**
 * FCMクライアントコンポーネント
 * Web Push通知の有効化とFCMトークンの取得を行うコンポーネント
 *
 * @param props FCMClientProps - コンポーネントのプロパティ
 * @returns JSX.Element
 */
export default function FcmClient({
  swScope = '/console/',
  swPath = '/console/firebase-messaging-sw.js',
  debug = false,
}: FCMClientProps = {}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string>('');
  const [lastMsg, setLastMsg] = useState<MessagePayload | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const [isPermissionKnown, setIsPermissionKnown] = useState(false);
  const [copied, setCopied] = useState(false);
  const swRegRef = useRef<ServiceWorkerRegistration | null>(null);
  const logger = useRef(createDebugger({ enabled: debug }));

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ok = await isSupported().catch(() => false);
      if (!mounted) return;
      setSupported(ok);
      logger.current.info('FCM support status:', ok);

      if (typeof Notification !== 'undefined') {
        setPermission(Notification.permission);
        logger.current.info('Notification permission:', Notification.permission);
      }
      setIsPermissionKnown(true);
      if (!ok || !('serviceWorker' in navigator)) return;

      const reg = await navigator.serviceWorker.register(swPath, {
        scope: swScope,
        updateViaCache: 'none',
      });
      swRegRef.current = reg;
      logger.current.info('Service Worker registered:', { scope: swScope, path: swPath });
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
        logger.current.debug('Received message:', payload);
      });
    })();
    return () => unsub();
  }, []);

  const fetchToken = async () => {
    setErrorMsg('');
    setIsFetchingToken(true);
    try {
      if (!(await isSupported())) {
        setErrorMsg(getErrorMessage('BROWSER_NOT_SUPPORTED'));
        return;
      }
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_WEBPUSH_KEY!;
      if (!vapidKey) {
        setErrorMsg(getErrorMessage('VAPID_KEY_MISSING'));
        return;
      }
      const reg = swRegRef.current ?? (await navigator.serviceWorker.ready);
      const messaging = getMessaging(firebaseApp);
      const t = await getToken(messaging, { vapidKey, serviceWorkerRegistration: reg });
      if (t) setToken(t);
    } catch (e) {
      logger.current.error('Failed to get token:', e);
      setErrorMsg(getErrorMessage('TOKEN_FETCH_FAILED'));
    } finally {
      setIsFetchingToken(false);
    }
  };

  const requestAndGetToken = async () => {
    setErrorMsg('');
    if (!(await isSupported())) {
      setErrorMsg(getErrorMessage('BROWSER_NOT_SUPPORTED'));
      return;
    }
    if (typeof Notification === 'undefined') {
      setErrorMsg(getErrorMessage('NOTIFICATION_API_UNAVAILABLE'));
      return;
    }
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p !== 'granted') {
      if (p === 'denied') setErrorMsg(getErrorMessage('NOTIFICATION_BLOCKED'));
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
              通知許可状態: {isPermissionKnown ? permission : '判定中…'}
            </span>
          </div>
        </header>

        {isPermissionKnown && permission !== 'granted' && (
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

        {debug && (
          <div className={styles.debugTools}>
            <button
              className={styles.btnDebug}
              onClick={() => printDebugInfo()}
            >
              デバッグ情報を表示
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
