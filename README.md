# PC周辺機器ブログ 自動投稿システム

PC周辺機器のレビュー記事をGitHubで管理し、WordPressに自動投稿するシステムです。

## 特徴

- ✍️ Markdownで記事を執筆
- 📅 毎日自動で1記事ずつ投稿
- 🤖 GitHub Actionsで完全自動化
- 📝 投稿履歴を自動管理

## 必要なもの

1. GitHubアカウント
2. WordPressサイト
3. WordPress Application Password

## セットアップ手順

### 1. このリポジトリをGitHubにアップロード

```bash
cd gadget-blog-automation
git init
git add .
git commit -m "初期コミット"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gadget-blog-automation.git
git push -u origin main
```

### 2. WordPress Application Passwordを取得

1. WordPressの管理画面にログイン
2. **ユーザー** → **プロフィール** に移動
3. 下にスクロールして **アプリケーションパスワード** セクションを探す
4. 新しいアプリケーション名を入力（例：`GitHub Actions`）
5. **新しいアプリケーションパスワードを追加** をクリック
6. 表示されたパスワードをコピー（スペースを含めて）

### 3. GitHub Secretsを設定

GitHubリポジトリの **Settings** → **Secrets and variables** → **Actions** で以下の3つを追加：

| Name | Value | 例 |
|------|-------|-----|
| `WORDPRESS_URL` | WordPressサイトのURL | `https://yourblog.com` |
| `WORDPRESS_USERNAME` | WordPressのユーザー名 | `admin` |
| `WORDPRESS_APP_PASSWORD` | 取得したアプリケーションパスワード | `xxxx xxxx xxxx xxxx` |

### 4. GitHub Actionsを有効化

1. リポジトリの **Actions** タブに移動
2. ワークフローを有効にする

## 使い方

### 記事を書く

1. `posts/` ディレクトリに新しい `.md` ファイルを作成
2. ファイル名は日付形式を推奨：`YYYY-MM-DD-title.md`
3. テンプレート（`posts/_template.md`）を参考に記事を書く

**記事の構造：**

```markdown
---
title: "記事のタイトル"
date: 2025-01-15T09:00:00+09:00
status: publish
categories: マウス
tags: ワイヤレス,レビュー
---

# 記事のタイトル

本文をここに書く...
```

### フロントマターの説明

- `title`: 記事のタイトル（必須）
- `date`: 投稿日時（ISO 8601形式）
- `status`:
  - `publish`: 公開
  - `draft`: 下書き
  - `private`: 非公開
- `categories`: カテゴリー名
- `tags`: カンマ区切りのタグ

### 記事を投稿

#### 自動投稿（推奨）

1. 記事ファイルをGitHubにプッシュ
2. 毎日午前9時（日本時間）に自動で1記事投稿される
3. 投稿済みの記事には `.published` ファイルが作成される

```bash
git add posts/2025-01-15-new-mouse.md
git commit -m "新しい記事を追加"
git push
```

#### 手動投稿

GitHubの **Actions** タブから手動で実行：

1. **Actions** タブをクリック
2. **WordPress 自動投稿** ワークフローを選択
3. **Run workflow** をクリック

## 投稿スケジュール

デフォルトでは毎日午前9時（日本時間）に投稿されます。

**変更方法：**

`.github/workflows/wordpress-publish.yml` の `cron` を編集：

```yaml
schedule:
  - cron: '0 0 * * *'  # 毎日 UTC 0:00 (JST 9:00)
```

**例：**
- 毎日午後3時（JST）: `cron: '0 6 * * *'`
- 毎週月曜日午前9時（JST）: `cron: '0 0 * * 1'`
- 月初（毎月1日）: `cron: '0 0 1 * *'`

## ディレクトリ構造

```
gadget-blog-automation/
├── .github/
│   └── workflows/
│       └── wordpress-publish.yml   # 自動投稿ワークフロー
├── posts/                          # 記事ディレクトリ
│   ├── _template.md               # 記事テンプレート
│   ├── 2025-01-01-example-post.md # サンプル記事
│   └── *.md.published             # 投稿済みフラグ
├── scripts/
│   └── publish-to-wordpress.js    # WordPress投稿スクリプト
├── package.json
└── README.md
```

## ローカルでのテスト

```bash
# 環境変数を設定
export WORDPRESS_URL="https://yourblog.com"
export WORDPRESS_USERNAME="your-username"
export WORDPRESS_APP_PASSWORD="xxxx xxxx xxxx xxxx"

# 記事を投稿
node scripts/publish-to-wordpress.js posts/2025-01-01-example-post.md
```

## トラブルシューティング

### 記事が投稿されない

1. GitHub Actions のログを確認
2. Secretsが正しく設定されているか確認
3. WordPressのREST APIが有効か確認（通常はデフォルトで有効）

### 認証エラー

- Application Passwordが正しいか確認
- WordPressのユーザー名（メールアドレスではなく）を使用しているか確認

### 同じ記事が二重投稿される

- `.published` ファイルがGitにコミットされているか確認
- ワークフローが正常に完了しているか確認

## カスタマイズ

### カテゴリーとタグの自動設定

`scripts/publish-to-wordpress.js` を編集して、カテゴリーIDやタグIDを取得・設定できます。

### 画像のアップロード

WordPressメディアライブラリに画像をアップロードする機能を追加できます。

## ライセンス

MIT

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
