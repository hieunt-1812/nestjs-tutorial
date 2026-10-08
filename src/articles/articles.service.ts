import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';
import { ArticleFavorite } from './entities/article-favorite.entity';
import { Follow } from '../profiles/entities/follow.entity';
import { User } from '../users/entities/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { FeedArticlesQueryDto } from './dto/feed-articles-query.dto';
import { ArticlesFormatterService } from './articles-formatter.service';
import {
  MultipleArticlesResponse,
  SingleArticleResponse,
} from './interfaces/article-view.interface';
import { ARTICLE_RELATIONS } from './articles.constants';
import { generateSlug } from './slug.util';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(ArticleFavorite)
    private readonly favoritesRepository: Repository<ArticleFavorite>,
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly formatter: ArticlesFormatterService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateArticleDto,
    authorId: string,
  ): Promise<SingleArticleResponse> {
    const articleId = await this.dataSource.transaction(async (manager) => {
      const tags = await this.resolveTags(manager, dto.tagList ?? []);
      const article = manager.create(Article, {
        slug: generateSlug(dto.title),
        title: dto.title,
        description: dto.description,
        body: dto.body,
        authorId,
        tags,
      });
      const saved = await manager.save(article);
      return saved.id;
    });
    return this.single(articleId, authorId);
  }

  async findBySlug(
    slug: string,
    currentUserId?: string,
  ): Promise<SingleArticleResponse> {
    const article = await this.getEntityBySlug(slug);
    return {
      article: await this.formatter.buildArticle(article, currentUserId),
    };
  }

  async list(
    query: ListArticlesQueryDto,
    currentUserId?: string,
  ): Promise<MultipleArticlesResponse> {
    const qb = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tags');

    if (query.tag) {
      qb.andWhere(
        'article.id IN ' +
          qb
            .subQuery()
            .select('at.articleId')
            .from('article_tags', 'at')
            .innerJoin('tags', 't', 't.id = at.tagId')
            .where('t.name = :tag')
            .getQuery(),
      ).setParameter('tag', query.tag);
    }

    if (query.author) {
      qb.andWhere('author.username = :author', { author: query.author });
    }

    if (query.favorited) {
      const user = await this.usersRepository.findOne({
        where: { username: query.favorited },
      });
      const favoriteArticleIds = user
        ? (
            await this.favoritesRepository.find({
              where: { userId: user.id },
            })
          ).map((f) => f.articleId)
        : [];
      qb.andWhere('article.id IN (:...favIds)', {
        favIds: favoriteArticleIds.length ? favoriteArticleIds : [null],
      });
    }

    const articlesCount = await qb.getCount();
    const articles = await qb
      .orderBy('article.createdAt', 'DESC')
      .skip(query.offset ?? 0)
      .take(query.limit ?? 20)
      .getMany();

    return {
      articles: await this.formatter.buildArticles(articles, currentUserId),
      articlesCount,
    };
  }

  async feed(
    query: FeedArticlesQueryDto,
    currentUserId: string,
  ): Promise<MultipleArticlesResponse> {
    const following = await this.followsRepository.find({
      where: { followerId: currentUserId },
    });
    const authorIds = following.map((f) => f.followingId);

    if (authorIds.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const [articles, articlesCount] =
      await this.articlesRepository.findAndCount({
        where: { authorId: In(authorIds) },
        relations: ARTICLE_RELATIONS,
        order: { createdAt: 'DESC' },
        skip: query.offset ?? 0,
        take: query.limit ?? 20,
      });

    return {
      articles: await this.formatter.buildArticles(articles, currentUserId),
      articlesCount,
    };
  }

  async update(
    slug: string,
    dto: UpdateArticleDto,
    currentUserId: string,
  ): Promise<SingleArticleResponse> {
    const articleId = await this.dataSource.transaction(async (manager) => {
      const article = await this.findForWrite(manager, slug, currentUserId);

      if (dto.title !== undefined) {
        article.title = dto.title;
        article.slug = generateSlug(dto.title);
      }
      if (dto.description !== undefined) article.description = dto.description;
      if (dto.body !== undefined) article.body = dto.body;

      await manager.save(article);
      return article.id;
    });
    return this.single(articleId, currentUserId);
  }

  async remove(slug: string, currentUserId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const article = await this.findForWrite(manager, slug, currentUserId);
      await manager.delete(Article, { id: article.id });
    });
  }

  async favorite(
    slug: string,
    currentUserId: string,
  ): Promise<SingleArticleResponse> {
    const article = await this.getEntityBySlug(slug);
    await this.favoritesRepository
      .createQueryBuilder()
      .insert()
      .values({ articleId: article.id, userId: currentUserId })
      .orIgnore()
      .execute();
    return this.single(article.id, currentUserId);
  }

  async unfavorite(
    slug: string,
    currentUserId: string,
  ): Promise<SingleArticleResponse> {
    const article = await this.getEntityBySlug(slug);
    await this.favoritesRepository.delete({
      articleId: article.id,
      userId: currentUserId,
    });
    return this.single(article.id, currentUserId);
  }

  private async single(
    id: string,
    currentUserId?: string,
  ): Promise<SingleArticleResponse> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ARTICLE_RELATIONS,
    });
    return {
      article: await this.formatter.buildArticle(article!, currentUserId),
    };
  }

  private async getEntityBySlug(slug: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: ARTICLE_RELATIONS,
    });
    if (!article) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    return article;
  }

  private async findForWrite(
    manager: EntityManager,
    slug: string,
    currentUserId: string,
  ): Promise<Article> {
    const article = await manager.findOne(Article, {
      where: { slug },
      lock: { mode: 'pessimistic_write' },
    });
    if (!article) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    this.assertAuthor(article, currentUserId);
    return article;
  }

  private assertAuthor(article: Article, currentUserId: string): void {
    if (article.authorId !== currentUserId) {
      throw new ForbiddenException('Bạn không có quyền thao tác bài viết này');
    }
  }

  private async resolveTags(
    manager: EntityManager,
    names: string[],
  ): Promise<Tag[]> {
    const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
    if (unique.length === 0) return [];

    await manager
      .createQueryBuilder()
      .insert()
      .into(Tag)
      .values(unique.map((name) => ({ name })))
      .orIgnore()
      .execute();

    return manager.find(Tag, { where: { name: In(unique) } });
  }
}
