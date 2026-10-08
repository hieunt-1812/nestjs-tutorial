import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';

@Entity('article_favorites')
@Unique('UQ_article_user_favorite', ['articleId', 'userId'])
export class ArticleFavorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  articleId: string;

  @Index()
  @Column('uuid')
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
