import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// 記事の型定義
export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description?: string;
}

export interface ArticlesData {
  updated_at: string;
  total: number;
  articles: Article[];
}

// GETリクエスト: 記事一覧を取得
export async function GET(request: Request) {
  try {
    // data/articles.json のパスを取得
    const filePath = path.join(process.cwd(), "data", "articles.json");

    // ファイルの存在確認
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          error: "Articles data not found",
          message:
            "Please run the scraper script first: python scripts/scraper.py",
        },
        { status: 404 }
      );
    }

    // JSONファイルを読み込み
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data: ArticlesData = JSON.parse(fileContent);

    // URLパラメータからフィルタリング条件を取得
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source"); // 例: ?source=Zenn
    const limit = searchParams.get("limit"); // 例: ?limit=10

    let filteredArticles = data.articles;

    // ソースでフィルタリング
    if (source) {
      filteredArticles = filteredArticles.filter(
        (article) => article.source.toLowerCase() === source.toLowerCase()
      );
    }

    // 件数制限
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        filteredArticles = filteredArticles.slice(0, limitNum);
      }
    }

    // レスポンスを返す
    return NextResponse.json({
      updated_at: data.updated_at,
      total: filteredArticles.length,
      articles: filteredArticles,
    });
  } catch (error) {
    console.error("Error reading articles:", error);
    return NextResponse.json(
      {
        error: "Failed to load articles",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
