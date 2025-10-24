export const FCM_ERRORS = {
  BROWSER_NOT_SUPPORTED: 'このブラウザは FCM の Web Push に対応していません。',
  VAPID_KEY_MISSING: 'VAPID 公開鍵が未設定です。NEXT_PUBLIC_FIREBASE_WEBPUSH_KEY を確認してください。',
  TOKEN_FETCH_FAILED: 'トークン取得に失敗しました。ページを再読み込みして再試行してください。',
  NOTIFICATION_API_UNAVAILABLE: 'この環境では通知APIが利用できません。',
  NOTIFICATION_BLOCKED: '通知がブロックされています。ブラウザのサイト設定から通知を許可してください。',
} as const;

// Function to get error message
export function getErrorMessage(
  errorKey: keyof typeof FCM_ERRORS
): string {
  return FCM_ERRORS[errorKey];
}
