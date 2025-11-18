import ArticleList from "./components/ArticleList";
import fs from "fs";
import path from "path";

// 記事の型定義
interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description?: string;
}

interface ArticlesData {
  updated_at: string;
  total: number;
  articles: Article[];
}

// JSONファイルから直接記事を取得する関数
function getArticles(): ArticlesData {
  try {
    const filePath = path.join(process.cwd(), "data", "articles.json");

    // ファイルの存在確認
    if (!fs.existsSync(filePath)) {
      return {
        updated_at: new Date().toISOString(),
        total: 0,
        articles: [],
      };
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data: ArticlesData = JSON.parse(fileContent);

    return data;
  } catch (error) {
    console.error("Error reading articles:", error);
    return {
      updated_at: new Date().toISOString(),
      total: 0,
      articles: [],
    };
  }
}

export default function Home() {
  // Server ComponentでJSONファイルから直接データを取得
  const data = getArticles();
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            DevFeed
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            技術記事を一箇所で。Zenn, Qiita, はてなブログの最新記事をチェック
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ArticleList articles={data.articles} updatedAt={data.updated_at} />
      </main>
    </div>
  );
}
