import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Article } from '../articles/entities/article.entity';
import { Follow } from '../profiles/entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Article, Follow])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
