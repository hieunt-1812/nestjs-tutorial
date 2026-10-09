import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Article } from '../articles/entities/article.entity';
import { User } from '../users/entities/user.entity';
import { Follow } from '../profiles/entities/follow.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  AuthorView,
  CommentView,
  SingleCommentResponse,
  MultipleCommentsResponse,
} from './interfaces/comment-response.interface';
import { COMMENT_RELATIONS } from './comments.constants';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
  ) {}

  async create(
    slug: string,
    dto: CreateCommentDto,
    currentUserId: string,
  ): Promise<SingleCommentResponse> {
    const article = await this.getArticleBySlug(slug);
    const comment = await this.commentsRepository.save(
      this.commentsRepository.create({
        body: dto.body,
        articleId: article.id,
        authorId: currentUserId,
      }),
    );
    const saved = await this.commentsRepository.findOne({
      where: { id: comment.id },
      relations: COMMENT_RELATIONS,
    });
    const [view] = await this.buildComments([saved!], currentUserId);
    return { comment: view };
  }

  async findByArticle(
    slug: string,
    currentUserId?: string,
  ): Promise<MultipleCommentsResponse> {
    const article = await this.getArticleBySlug(slug);
    const comments = await this.commentsRepository.find({
      where: { articleId: article.id },
      relations: COMMENT_RELATIONS,
      order: { createdAt: 'DESC' },
    });
    return { comments: await this.buildComments(comments, currentUserId) };
  }

  async remove(
    slug: string,
    commentId: string,
    currentUserId: string,
  ): Promise<void> {
    const article = await this.getArticleBySlug(slug);
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, articleId: article.id },
    });
    if (!comment) {
      throw new NotFoundException('Không tìm thấy bình luận');
    }
    if (comment.authorId !== currentUserId) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }
    await this.commentsRepository.remove(comment);
  }

  private async getArticleBySlug(slug: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({ where: { slug } });
    if (!article) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    return article;
  }

  private async buildComments(
    comments: Comment[],
    currentUserId?: string,
  ): Promise<CommentView[]> {
    if (comments.length === 0) return [];

    const authorIds = [...new Set(comments.map((c) => c.authorId))];
    const followingSet = await this.followingAuthors(authorIds, currentUserId);

    return comments.map((comment) => ({
      id: comment.id,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      body: comment.body,
      author: this.buildAuthor(comment.author, followingSet),
    }));
  }

  private buildAuthor(user: User, followingSet: Set<string>): AuthorView {
    return {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: followingSet.has(user.id),
    };
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
