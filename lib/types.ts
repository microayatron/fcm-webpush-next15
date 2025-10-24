import type { MessagePayload } from 'firebase/messaging';

/**
 * FCMクライアントの状態を管理するための型定義
 */
export interface FCMClientState {
  /** FCMがサポートされているかどうか */
  supported: boolean | null;
  /** 通知の許可状態 */
  permission: NotificationPermission;
  /** FCMトークン */
  token: string;
  /** 最後に受信したメッセージ */
  lastMessage: MessagePayload | null;
  /** エラーメッセージ */
  errorMessage: string;
  /** トークン取得中かどうか */
  isFetchingToken: boolean;
  /** 通知許可状態が判明しているかどうか */
  isPermissionKnown: boolean;
  /** トークンがコピーされたかどうか */
  copied: boolean;
}

/**
 * FCMクライアントのプロパティ型定義
 */
export interface FCMClientProps {
  /** Service Workerのスコープ（デフォルト: '/console/'） */
  swScope?: string;
  /** Service Workerのパス（デフォルト: '/console/firebase-messaging-sw.js'） */
  swPath?: string;
  /** デバッグモードの有効/無効（デフォルト: false） */
  debug?: boolean;
}
