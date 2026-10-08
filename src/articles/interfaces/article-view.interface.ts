export interface AuthorView {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

export interface ArticleView {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: Date;
  updatedAt: Date;
  favorited: boolean;
  favoritesCount: number;
  author: AuthorView;
}

export interface SingleArticleResponse {
  article: ArticleView;
}

export interface MultipleArticlesResponse {
  articles: ArticleView[];
  articlesCount: number;
}
