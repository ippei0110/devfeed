"use client";

import { useMemo, useState } from "react";

// 記事の型定義
interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description?: string;
}

interface ArticleListProps {
  articles: Article[];
  updatedAt: string;
}

type FilterType = "すべて" | "Zenn" | "Qiita" | "はてなブログ";

export default function ArticleList({ articles, updatedAt }: ArticleListProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("すべて");
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedKeyword = searchTerm.trim().toLowerCase();

  // フィルタリングされた記事
  const filteredArticles = useMemo(() => {
    const filteredBySource =
      selectedFilter === "すべて"
        ? articles
        : articles.filter((article) => article.source === selectedFilter);

    if (!normalizedKeyword) {
      return filteredBySource;
    }

    return filteredBySource.filter((article) => {
      const inTitle = article.title.toLowerCase().includes(normalizedKeyword);
      const inDescription = article.description
        ?.toLowerCase()
        .includes(normalizedKeyword);
      const inSource = article.source.toLowerCase().includes(normalizedKeyword);

      return inTitle || inDescription || inSource;
    });
  }, [articles, normalizedKeyword, selectedFilter]);

  // 各ソースの記事数をカウント
  const counts = {
    すべて: articles.length,
    Zenn: articles.filter((a) => a.source === "Zenn").length,
    Qiita: articles.filter((a) => a.source === "Qiita").length,
    はてなブログ: articles.filter((a) => a.source === "はてなブログ").length,
  };

  const filters: FilterType[] = ["すべて", "Zenn", "Qiita", "はてなブログ"];

  return (
    <>
      {/* フィルター & 検索セクション */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === filter
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
              }`}
            >
              {filter}
              <span className="ml-1.5 text-xs opacity-75">
                ({counts[filter]})
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <label htmlFor="article-search" className="sr-only">
            記事検索
          </label>
          <input
            id="article-search"
            type="search"
            placeholder="キーワードで記事を検索 (タイトル / 説明 / ソース)"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!!searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* 更新日時 */}
      {updatedAt && (
        <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-500">
          最終更新:{" "}
          {new Date(updatedAt).toLocaleString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          <span className="ml-3">表示中: {filteredArticles.length}件</span>
        </div>
      )}

      {/* 記事リスト */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-12 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            {selectedFilter === "すべて"
              ? "記事がありません。"
              : `${selectedFilter}の記事がありません。`}
            {selectedFilter === "すべて" && (
              <>
                <br />
                <code className="mt-2 inline-block px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-sm">
                  python scripts/scraper.py
                </code>
                <br />
                を実行して記事を取得してください。
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h2>
                  </a>
                  {article.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {article.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium">
                      {article.source}
                    </span>
                    <time dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString(
                        "ja-JP",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </time>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
