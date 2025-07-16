# 2024-06-13_news-automation
## 🛠 実装目的
- GitHub Issueで投稿されたイベント情報をAIで解析し、my-app/public/news.json（多言語・新スキーマ）に自動反映・コミット・デプロイまで自動化するため。

## 📝 要件
- news.jsonはid, date, title, detail, venue, open_time, start_time, performers, fee, contact, link等の多言語フィールドを持つ
- GitHub Issueで新イベント情報が投稿された場合、その内容を解析してnews.jsonに追加
- 必須情報がない場合はエラー、複数イベントが含まれる場合は個別審査しOKなものだけ追加、NGはエラー
- news.jsonのスキーマは現行のまま、Node.jsスクリプトで厳密バリデーション
- 既存news.jsonデータは絶対に消さず、append方式で新しいイベント情報を加える
- dateフィールドで降順（新しい日付が先頭）にソート

## 🔧 作業内容
- my-app/types/news.ts: 新スキーマ対応TypeScript型定義を新規作成
- my-app/scripts/parse-issue-to-news.js: Node.jsスクリプト本実装（GITHUB_EVENT_PATHからIssue本文取得→Claude CLI呼び出し→バリデーション→append→降順ソート→保存）
- my-app/scripts/package.json: 依存管理ファイル新規作成、ajv/uuid等を追加
- 依存パッケージnpm install済み（Claude CLIはnpmレジストリ外のためグローバル運用）
- my-app/_docs/2024-06-13_news-automation.md: 実装ログを随時追記
- 必要なディレクトリ（types, scripts, _docs）を新規作成
- .github/workflows/parse-issue-to-news.yml: CI/CDワークフロー雛形を整備

## ✅ 完了条件
- 型定義・スクリプト本実装・実装ログ・依存管理・CI/CD構成がmy-app配下で完結
- news.jsonのappend・降順ソート・厳密バリデーション・Claude CLI連携が自動化

## ⏭ 次にやること（TODO）
- Claude CLIのAPIキーをGitHub Actions Secretで安全運用
- LLMプロンプト例・期待JSON出力例のドキュメント化
- CI上での動作検証・エラー時の通知設計
- 必要に応じてTypeScript/Schemaの厳密化

## 💬 備考（任意）
- Claude CLIはnpmレジストリ外のため、グローバルインストールまたはActions内で個別インストール運用
- news.jsonの既存データは絶対に消さず、append+降順ソートのみ
- pushはCI内コミットのみ、リモートpushは運用方針により不要 