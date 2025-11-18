# DevFeed スクレイピングスクリプト

このディレクトリには、技術記事を収集する Python スクリプトが含まれています。

## 仕組み

1. **スクレイピング実行** - `scraper.py` が Zenn/Qiita/はてなブログから記事を取得
2. **JSON 生成** - 取得した記事を `../data/articles.json` に保存
3. **Git にコミット** - JSON ファイルをリポジトリにコミット
4. **Vercel で利用** - Next.js の API Route が保存された JSON を読み込む

## セットアップ

### 1. Python 環境の準備

```bash
# Python 3.8以上が必要
python3 --version

# 仮想環境を作成（推奨）
python3 -m venv venv

# 仮想環境を有効化
source venv/bin/activate  # macOS/Linux
# または
venv\Scripts\activate  # Windows
```

### 2. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

## 使い方

### 記事を取得

```bash
cd scripts
python scraper.py
```

実行すると：

- Zenn から最新 10 件
- Qiita から最新 10 件
- はてなブログから最新 10 件

合計約 30 件の記事を取得して `data/articles.json` に保存します。

### 定期実行（オプション）

cron や GitHub Actions で定期的に実行することもできます。

**例: 毎日朝 9 時に実行**

```bash
# crontabに追加
0 9 * * * cd /path/to/devfeed/scripts && python scraper.py && git add ../data/articles.json && git commit -m "Update articles" && git push
```

## 取得元

| サイト       | 取得方法                                       | 件数  |
| ------------ | ---------------------------------------------- | ----- |
| Zenn         | RSS (`https://zenn.dev/feed`)                  | 10 件 |
| Qiita        | 公式 API (`https://qiita.com/api/v2/items`)    | 10 件 |
| はてなブログ | RSS (`https://b.hatena.ne.jp/hotentry/it.rss`) | 10 件 |

## 出力形式

`data/articles.json` の構造：

```json
{
  "updated_at": "2025-11-18T10:00:00.000000",
  "total": 30,
  "articles": [
    {
      "id": "zenn_article123",
      "title": "記事タイトル",
      "url": "https://zenn.dev/...",
      "source": "Zenn",
      "publishedAt": "2025-11-18",
      "description": "記事の説明..."
    }
  ]
}
```

## トラブルシューティング

### エラー: ModuleNotFoundError

```bash
pip install -r requirements.txt
```

### エラー: タイムアウト

ネットワーク接続を確認してください。一部のサイトが取得できなくても、他のサイトからは取得を続行します。

## カスタマイズ

取得件数を変更する場合は、`scraper.py` の `fetch_all()` メソッド内の `limit` パラメータを変更してください。

```python
zenn_articles = self.fetch_zenn_articles(limit=20)  # 10 → 20に変更
```
