import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { ArticleFavorite } from './entities/article-favorite.entity';
import { Follow } from '../profiles/entities/follow.entity';
import { ArticleView } from './interfaces/article-view.interface';

@Injectable()
export class ArticlesFormatterService {
  constructor(
    @InjectRepository(ArticleFavorite)
    private readonly favoritesRepository: Repository<ArticleFavorite>,
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
  ) {}

  async buildArticle(
    article: Article,
    currentUserId?: string,
  ): Promise<ArticleView> {
    const [view] = await this.buildArticles([article], currentUserId);
    return view;
  }

  async buildArticles(
    articles: Article[],
    currentUserId?: string,
  ): Promise<ArticleView[]> {
    if (articles.length === 0) return [];

    const articleIds = articles.map((a) => a.id);
    const authorIds = [...new Set(articles.map((a) => a.authorId))];
    const [favoritesCountMap, favoritedSet, followingSet] = await Promise.all([
      this.countFavorites(articleIds),
      this.favoritedByUser(articleIds, currentUserId),
      this.followingAuthors(authorIds, currentUserId),
    ]);

    return articles.map((article) => ({
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: (article.tags ?? []).map((tag) => tag.name).sort(),
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited: favoritedSet.has(article.id),
      favoritesCount: favoritesCountMap.get(article.id) ?? 0,
      author: {
        username: article.author.username,
        bio: article.author.bio,
        image: article.author.image,
        following: followingSet.has(article.authorId),
      },
    }));
  }

  private async countFavorites(
    articleIds: string[],
  ): Promise<Map<string, number>> {
    const rows = await this.favoritesRepository
      .createQueryBuilder('fav')
      .select('fav.articleId', 'articleId')
      .addSelect('COUNT(*)', 'count')
      .where('fav.articleId IN (:...articleIds)', { articleIds })
      .groupBy('fav.articleId')
      .getRawMany<{ articleId: string; count: string }>();

    return new Map(rows.map((r) => [r.articleId, Number(r.count)]));
  }

  private async favoritedByUser(
    articleIds: string[],
    currentUserId?: string,
  ): Promise<Set<string>> {
    if (!currentUserId) return new Set();

    const rows = await this.favoritesRepository.find({
      where: { userId: currentUserId, articleId: In(articleIds) },
    });
    return new Set(rows.map((r) => r.articleId));
  }

  private async followingAuthors(
    authorIds: string[],
    currentUserId?: string,
  ): Promise<Set<string>> {
    if (!currentUserId) return new Set();

    const rows = await this.followsRepository.find({
      where: { followerId: currentUserId, followingId: In(authorIds) },
    });
    return new Set(rows.map((r) => r.followingId));
  }
}
