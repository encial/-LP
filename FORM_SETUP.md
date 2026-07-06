# 問い合わせフォームとスプレッドシートの接続状況

フォーム画面、メール送信、スプレッドシート保存を接続済みです。

## 現在の接続先

- メール通知：`info-encial@inc.com`
- スプレッドシート：公式LINEフォームで使用中の既存Google Apps Script Webhook
- Webhook URL：`config.js` に設定済み

フォーム送信時に以下を同時実行します。

- `info-encial@inc.com` へお問い合わせ内容を送信
- 公式LINEと同じスプレッドシートへ顧客情報を追加

## 初回のみ必要な操作

メール通知サービスから `info-encial@inc.com` に認証メールが届いた場合は、メール本文の認証ボタンを一度押してください。

`google-apps-script.gs` は将来、LP専用のWebhookへ分離する場合に使用できるバックアップ実装です。
