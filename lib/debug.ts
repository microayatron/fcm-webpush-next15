/**
 * FCMクライアントのデバッグユーティリティ
 */

/**
 * デバッグログのレベル
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * デバッグログのオプション
 */
export interface DebugOptions {
  enabled: boolean;
  level: LogLevel;
  prefix?: string;
}

/**
 * デフォルトのデバッグオプション
 */
const DEFAULT_OPTIONS: DebugOptions = {
  enabled: false,
  level: 'info',
  prefix: '[FCM]',
};

/**
 * ログレベルの重要度
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  error: 3,
  warn: 2,
  info: 1,
  debug: 0,
};

/**
 * デバッグロガーを作成する
 * @param options デバッグオプション
 * @returns ロガー関数のオブジェクト
 */
export function createDebugger(options: Partial<DebugOptions> = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { enabled, level, prefix } = opts;

  const shouldLog = (msgLevel: LogLevel) =>
    enabled && LOG_LEVELS[msgLevel] >= LOG_LEVELS[level];

  const formatMessage = (message: string) =>
    prefix ? `${prefix} ${message}` : message;

  return {
    error: (message: string, ...args: unknown[]) => {
      if (shouldLog('error')) {
        console.error(formatMessage(message), ...args);
      }
    },
    warn: (message: string, ...args: unknown[]) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage(message), ...args);
      }
    },
    info: (message: string, ...args: unknown[]) => {
      if (shouldLog('info')) {
        console.info(formatMessage(message), ...args);
      }
    },
    debug: (message: string, ...args: unknown[]) => {
      if (shouldLog('debug')) {
        console.debug(formatMessage(message), ...args);
      }
    },
  };
}

/**
 * FCMクライアントのデバッグ情報を収集する
 */
export function collectDebugInfo() {
  return {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    serviceWorker: {
      supported: 'serviceWorker' in navigator,
      controller: !!navigator.serviceWorker?.controller,
    },
    notification: {
      supported: 'Notification' in window,
      permission: Notification.permission,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasVapidKey: !!process.env.NEXT_PUBLIC_FIREBASE_WEBPUSH_KEY,
    },
  };
}

/**
 * デバッグ情報をコンソールに出力する
 */
export function printDebugInfo() {
  const info = collectDebugInfo();
  console.group('[FCM Debug Info]');
  console.log('Timestamp:', info.timestamp);
  console.log('User Agent:', info.userAgent);
  console.log('Platform:', info.platform);
  console.log('Language:', info.language);
  console.group('Service Worker');
  console.log('Supported:', info.serviceWorker.supported);
  console.log('Controller:', info.serviceWorker.controller);
  console.groupEnd();
  console.group('Notification');
  console.log('Supported:', info.notification.supported);
  console.log('Permission:', info.notification.permission);
  console.groupEnd();
  console.group('Environment');
  console.log('Node ENV:', info.environment.nodeEnv);
  console.log('Has VAPID Key:', info.environment.hasVapidKey);
  console.groupEnd();
  console.groupEnd();
}
