# 📰 DevFeed

技術記事を一箇所で。Zenn、Qiita、はてなブログの最新記事を集約して表示する Web アプリケーションです。

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.8+-green?style=flat-square&logo=python)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)

## 🎯 特徴

- **複数サイトの記事を集約** - Zenn、Qiita、はてなブログの最新記事を一括表示
- **リアルタイムフィルタリング** - ソースごとに記事を絞り込み
- **レスポンシブデザイン** - モバイル・タブレット・デスクトップに対応
- **ダークモード対応** - システム設定に応じて自動切り替え
- **Python スクレイピング** - RSS フィードと API を活用したデータ収集

## 🏗️ 技術スタック

### フロントエンド

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **React 19**

### バックエンド

- **Next.js API Routes** - サーバーサイド API
- **Python** - スクレイピングスクリプト
  - `requests` - HTTP 通信
  - `beautifulsoup4` - HTML/XML パース

### デプロイ

- **Vercel** - ホスティング

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/devfeed.git
cd devfeed
```

### 2. 依存関係のインストール

**Node.js（フロントエンド）:**

```bash
npm install
```

**Python（スクレイピング）:**

```bash
cd scripts
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# または
venv\Scripts\activate  # Windows

pip install -r requirements.txt
cd ..
```

### 3. 記事データの取得

```bash
# Python仮想環境を有効化してから実行
python scripts/scraper.py
```

これで `data/articles.json` が生成されます。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 📁 プロジェクト構造

```
devfeed/
├── app/
│   ├── api/
│   │   └── articles/
│   │       └── route.ts          # 記事取得API
│   ├── components/
│   │   └── ArticleList.tsx       # 記事リスト（フィルター付き）
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # メインページ
├── scripts/
│   ├── scraper.py                # Pythonスクレイピングスクリプト
│   ├── requirements.txt          # Python依存関係
│   └── README.md                 # スクレイピングの詳細
├── data/
│   └── articles.json             # 取得した記事データ
├── public/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🔄 データフロー

```
┌─────────────────────────────────────────┐
│ 1. Pythonスクレイピング（ローカル）      │
│    scripts/scraper.py                   │
│    ↓                                    │
│    Zenn/Qiita/はてなブログから記事取得  │
│    ↓                                    │
│    data/articles.json に保存            │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 2. Next.js API Route（Vercel）         │
│    app/api/articles/route.ts            │
│    ↓                                    │
│    articles.json を読み込み             │
│    ↓                                    │
│    JSON形式でレスポンス                 │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 3. フロントエンド（ブラウザ）           │
│    app/page.tsx                         │
│    ↓                                    │
│    /api/articles を取得                 │
│    ↓                                    │
│    記事を表示                           │
└─────────────────────────────────────────┘
```

## 🎨 主な機能

### フィルタリング

- **すべて** - 全記事を表示
- **Zenn** - Zenn の記事のみ
- **Qiita** - Qiita の記事のみ
- **はてなブログ** - はてなブログの記事のみ

各フィルターには記事数が表示されます。

### 記事カード

- タイトル
- 説明文（最初の 200 文字）
- ソース（Zenn/Qiita/はてなブログ）
- 公開日

## 🔧 カスタマイズ

### 取得記事数の変更

`scripts/scraper.py` の `fetch_all()` メソッド内の `limit` を変更：

```python
zenn_articles = self.fetch_zenn_articles(limit=20)  # 10 → 20
```

### スクレイピング元の追加

`scripts/scraper.py` に新しいメソッドを追加し、`fetch_all()` で呼び出します。

## 📝 API エンドポイント

### GET /api/articles

記事一覧を取得します。

**クエリパラメータ:**

- `source` (オプション) - フィルタリングするソース（`Zenn`, `Qiita`, `はてなブログ`）
- `limit` (オプション) - 取得件数の上限

**例:**

```bash
# すべての記事
curl http://localhost:3000/api/articles

# Zennの記事のみ
curl http://localhost:3000/api/articles?source=Zenn

# 最初の5件のみ
curl http://localhost:3000/api/articles?limit=5
```

## 🚀 デプロイ

### Vercel へのデプロイ

1. [Vercel](https://vercel.com) にサインアップ
2. GitHub リポジトリを接続
3. プロジェクトをインポート
4. 自動的にビルド＆デプロイ

**注意:** `data/articles.json` を Git にコミットしておく必要があります。

### 記事の更新

デプロイ後に記事を更新したい場合：

```bash
# ローカルで実行
python scripts/scraper.py

# Gitにコミット＆プッシュ
git add data/articles.json
git commit -m "Update articles"
git push
```

Vercel が自動的に再デプロイします。

## 🔮 今後の改善案

- [ ] GitHub Actions で定期的な自動スクレイピング
- [ ] 検索機能
- [ ] ソート機能（日付順/人気順）
- [ ] お気に入り機能（LocalStorage）
- [ ] ページネーション
- [ ] RSS 配信

## 📄 ライセンス

MIT

## 👤 作成者

[Your Name](https://github.com/yourusername)

---

⭐ このプロジェクトが気に入ったら、スターをつけてください！
