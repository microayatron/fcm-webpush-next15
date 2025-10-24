# FCM Web Push Notification Demo with Next.js

このリポジトリは、Firebase Cloud Messaging (FCM)を使用してWeb Push通知を実装するデモプロジェクトです。Next.js 15とFirebase SDKを使用して、プッシュ通知の実装方法を示しています。

## 機能

- FCMを使用したWeb Push通知の実装
- Service Workerの登録と管理
- プッシュ通知の許可要求と状態管理
- FCMトークンの取得と管理
- フォアグラウンドメッセージの受信と表示

## 必要要件

- Node.js 22.19.0以上
- Firebase プロジェクト
- FCMのVAPIDキー

## セットアップ手順

1. リポジトリのクローン:
```bash
git clone https://github.com/yourusername/fcm-webpush-next15.git
cd fcm-webpush-next15
```

2. 依存関係のインストール:
```bash
npm install
```

3. 環境変数の設定:
`.env.local`ファイルを作成し、以下の環境変数を設定

| 環境変数 | 説明 | 取得方法 |
|----------|------|----------|
| NEXT_PUBLIC_FIREBASE_API_KEY | Firebaseプロジェクトのアプリ設定から取得できるAPIキー | Firebase Consoleのプロジェクト設定 > 全般 |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | 認証用のドメイン | Firebase Consoleのプロジェクト設定 > 全般 |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | プロジェクトID | Firebase Consoleのプロジェクト設定 > 全般 |
| NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | Storageのバケット名 | Firebase Consoleのプロジェクト設定 > 全般 |
| NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | FCMの送信者ID | Firebase Consoleのプロジェクト設定 > クラウドメッセージング |
| NEXT_PUBLIC_FIREBASE_APP_ID | Firebaseアプリケーションのアプリケーションid | Firebase Consoleのプロジェクト設定 > 全般 |
| NEXT_PUBLIC_FIREBASE_WEBPUSH_KEY | Web Push通知用のVAPIDキー | Firebase Consoleのプロジェクト設定 > クラウドメッセージング > Web設定 > Web Push証明書 |

4. 開発サーバーの起動:
```bash
npm run dev
```

5. ブラウザでアクセス:
[http://localhost:3000/console](http://localhost:3000/console) にアクセスしてデモを確認


## 使用方法

1. **通知の許可**:
   - `/console`ページにアクセス
   - 「通知を有効化」ボタンをクリック
   - ブラウザの通知許可ダイアログで「許可」を選択

2. **FCMトークンの取得**:
   - 通知を許可すると自動的にFCMトークンが取得されます
   - 取得したトークンは画面に表示され、コピーボタンで簡単にコピー可能

3. **テスト通知の送信**:
   - Firebase Consoleの「Cloud Messaging」セクションに移動
   - 「最初のキャンペーンを送信」をクリック
   - 通知のタイトルとテキストを入力
   - ターゲットの「テストトークン」を選択
   - コピーしたFCMトークンを貼り付け
   - 「テストメッセージを送信」をクリック

## デバッグ

- `/console`機能では、`debug = true`を設定することで以下のデバッグ機能が有効になります：
  - ブラウザのコンソールにFCM関連の詳細なログが出力されます
  - 画面上に「デバッグ情報を表示」ボタンが表示され、クリックすると以下の情報を確認できます：
    - ブラウザ環境（UserAgent、プラットフォーム、言語）
    - Service Workerの状態
    - 通知APIの状態
    - 環境変数の設定状態
- Service Workerの状態は`chrome://serviceworker-internals/`で確認できます
- フォアグラウンドで受信したメッセージは画面上に表示されます

## 注意事項

- VAPIDキーは必ずWeb Push証明書から取得したものを使用してください
- 本番環境では適切なセキュリティ対策を実装してください
- Service Workerのスコープに注意してください（デモでは`/console/`に設定）

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 関連リソース

- [Firebase Cloud Messaging公式ドキュメント](https://firebase.google.com/docs/cloud-messaging)
- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [FirebaseコンソールからWebプッシュ通知を配信する（実装編）](https://microayatron.com/firebase-notifications-composer)