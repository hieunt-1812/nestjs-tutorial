import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ArticlesFormatterService } from './articles-formatter.service';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';
import { ArticleFavorite } from './entities/article-favorite.entity';
import { Follow } from '../profiles/entities/follow.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Tag, ArticleFavorite, Follow, User]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticlesFormatterService],
})
export class ArticlesModule {}
