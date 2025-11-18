import ArticleList from "./components/ArticleList";

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

// APIから記事を取得する関数
async function getArticles(): Promise<ArticlesData> {
  try {
    // 開発環境では localhost、本番環境では vercel のURLを使用
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/articles`, {
      // Server Componentでは cache オプションを使用
      cache: "no-store", // リロードのたびに最新データを取得
    });

    if (!res.ok) {
      throw new Error("Failed to fetch articles");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching articles:", error);
    // エラー時は空のデータを返す
    return {
      updated_at: new Date().toISOString(),
      total: 0,
      articles: [],
    };
  }
}

export default async function Home() {
  // Server Componentでデータを取得
  const data = await getArticles();
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
