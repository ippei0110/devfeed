"""
DevFeed スクレイピングスクリプト

このスクリプトは以下のサイトから最新の技術記事を取得します：
- Zenn (RSS)
- Qiita (公式API)
- はてなブログ (RSS)

取得したデータは data/articles.json に保存されます。
"""

import json
import os
from datetime import datetime
from typing import List, Dict
import requests
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET


class ArticleScraper:
    """記事をスクレイピングして収集するクラス"""
    
    def __init__(self):
        self.articles: List[Dict] = []
    
    def fetch_zenn_articles(self, limit: int = 10) -> List[Dict]:
        """
        ZennのRSSフィードから記事を取得
        RSS URL: https://zenn.dev/feed
        """
        print("📚 Zennから記事を取得中...")
        try:
            response = requests.get("https://zenn.dev/feed", timeout=10)
            response.raise_for_status()
            
            # XMLをパース
            root = ET.fromstring(response.content)
            articles = []
            
            # RSS 2.0形式
            for item in root.findall(".//item")[:limit]:
                title = item.find("title")
                link = item.find("link")
                pub_date = item.find("pubDate")
                description = item.find("description")
                
                if title is not None and link is not None:
                    article = {
                        "id": f"zenn_{link.text.split('/')[-1]}",
                        "title": title.text,
                        "url": link.text,
                        "source": "Zenn",
                        "publishedAt": self._parse_date(pub_date.text if pub_date is not None else ""),
                        "description": self._clean_html(description.text if description is not None else "")
                    }
                    articles.append(article)
            
            print(f"✅ Zennから {len(articles)} 件取得")
            return articles
            
        except Exception as e:
            print(f"❌ Zennの取得に失敗: {e}")
            return []
    
    def fetch_qiita_articles(self, limit: int = 10) -> List[Dict]:
        """
        Qiita APIから記事を取得
        API URL: https://qiita.com/api/v2/items
        """
        print("📚 Qiitaから記事を取得中...")
        try:
            headers = {
                "User-Agent": "DevFeed/1.0"
            }
            # 公開APIを使用（認証不要）
            response = requests.get(
                "https://qiita.com/api/v2/items",
                params={"page": 1, "per_page": limit},
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            articles = []
            
            for item in data:
                article = {
                    "id": f"qiita_{item['id']}",
                    "title": item["title"],
                    "url": item["url"],
                    "source": "Qiita",
                    "publishedAt": item["created_at"][:10],  # YYYY-MM-DD形式に
                    "description": item.get("body", "")[:150] + "..."  # 最初の150文字
                }
                articles.append(article)
            
            print(f"✅ Qiitaから {len(articles)} 件取得")
            return articles
            
        except Exception as e:
            print(f"❌ Qiitaの取得に失敗: {e}")
            return []
    
    def fetch_hatena_articles(self, limit: int = 10) -> List[Dict]:
        """
        はてなブログのホットエントリー（テクノロジー）から記事を取得
        RSS URL: https://b.hatena.ne.jp/hotentry/it.rss
        """
        print("📚 はてなブログから記事を取得中...")
        try:
            response = requests.get("https://b.hatena.ne.jp/hotentry/it.rss", timeout=10)
            response.raise_for_status()
            
            # XMLをパース
            root = ET.fromstring(response.content)
            articles = []
            
            # RDF形式とRSS 2.0形式の両方に対応
            # まずRDF形式を試す
            items = root.findall(".//{http://purl.org/rss/1.0/}item")
            
            # RDF形式のアイテムがない場合、RSS 2.0形式を試す
            if not items:
                items = root.findall(".//item")
            
            for item in items[:limit]:
                # RDF形式のタグを試す
                title = item.find("{http://purl.org/rss/1.0/}title")
                link = item.find("{http://purl.org/rss/1.0/}link")
                date = item.find("{http://purl.org/dc/elements/1.1/}date")
                description = item.find("{http://purl.org/rss/1.0/}description")
                
                # RSS 2.0形式のタグも試す
                if title is None:
                    title = item.find("title")
                if link is None:
                    link = item.find("link")
                if date is None:
                    date = item.find("pubDate")
                if description is None:
                    description = item.find("description")
                
                if title is not None and link is not None:
                    # テキストの取得（Noneチェック）
                    title_text = title.text if title.text else "タイトルなし"
                    link_text = link.text if link.text else ""
                    
                    # 日付の処理
                    if date is not None and date.text:
                        try:
                            # ISO形式の日付の場合
                            if 'T' in date.text:
                                published_date = date.text[:10]
                            else:
                                # RFC 2822形式の日付の場合
                                published_date = self._parse_date(date.text)
                        except:
                            published_date = datetime.now().strftime("%Y-%m-%d")
                    else:
                        published_date = datetime.now().strftime("%Y-%m-%d")
                    
                    # 説明文の処理
                    desc_text = description.text if description is not None and description.text else ""
                    
                    article = {
                        "id": f"hatena_{abs(hash(link_text))}",
                        "title": title_text,
                        "url": link_text,
                        "source": "はてなブログ",
                        "publishedAt": published_date,
                        "description": self._clean_html(desc_text) if desc_text else ""
                    }
                    articles.append(article)
            
            print(f"✅ はてなブログから {len(articles)} 件取得")
            return articles
            
        except Exception as e:
            print(f"❌ はてなブログの取得に失敗: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def _parse_date(self, date_str: str) -> str:
        """日付文字列をYYYY-MM-DD形式に変換"""
        try:
            # RFC 2822形式の日付をパース
            from email.utils import parsedate_to_datetime
            dt = parsedate_to_datetime(date_str)
            return dt.strftime("%Y-%m-%d")
        except:
            return datetime.now().strftime("%Y-%m-%d")
    
    def _clean_html(self, html: str) -> str:
        """HTMLタグを除去してプレーンテキストに変換"""
        if not html:
            return ""
        
        try:
            soup = BeautifulSoup(html, "html.parser")
            text = soup.get_text()
            # 改行や余分な空白を削除
            text = " ".join(text.split())
            return text[:200] + "..." if len(text) > 200 else text
        except:
            return ""
    
    def fetch_all(self):
        """すべてのソースから記事を取得"""
        print("\n🚀 記事の取得を開始します...\n")
        
        # 各ソースから記事を取得
        zenn_articles = self.fetch_zenn_articles(limit=10)
        qiita_articles = self.fetch_qiita_articles(limit=10)
        hatena_articles = self.fetch_hatena_articles(limit=10)
        
        # 統合
        self.articles = zenn_articles + qiita_articles + hatena_articles
        
        # 日付でソート（新しい順）
        self.articles.sort(key=lambda x: x["publishedAt"], reverse=True)
        
        print(f"\n✨ 合計 {len(self.articles)} 件の記事を取得しました\n")
    
    def save_to_json(self, output_path: str = "data/articles.json"):
        """取得した記事をJSONファイルに保存"""
        # dataディレクトリがなければ作成
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # メタデータを追加
        output_data = {
            "updated_at": datetime.now().isoformat(),
            "total": len(self.articles),
            "articles": self.articles
        }
        
        # JSON形式で保存
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 {output_path} に保存しました")


def main():
    """メイン処理"""
    scraper = ArticleScraper()
    scraper.fetch_all()
    scraper.save_to_json()
    print("\n🎉 完了！\n")


if __name__ == "__main__":
    main()
