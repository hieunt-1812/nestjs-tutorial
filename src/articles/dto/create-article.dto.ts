import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ARTICLE_LIMITS } from '../articles.constants';

export class CreateArticleDto {
  @ApiProperty({
    example: 'How to train your dragon',
    minLength: ARTICLE_LIMITS.TITLE_MIN,
    maxLength: ARTICLE_LIMITS.TITLE_MAX,
  })
  @IsNotEmpty()
  @IsString()
  @Length(ARTICLE_LIMITS.TITLE_MIN, ARTICLE_LIMITS.TITLE_MAX)
  title: string;

  @ApiProperty({
    example: 'Ever wonder how?',
    minLength: ARTICLE_LIMITS.DESCRIPTION_MIN,
    maxLength: ARTICLE_LIMITS.DESCRIPTION_MAX,
  })
  @IsNotEmpty()
  @IsString()
  @Length(ARTICLE_LIMITS.DESCRIPTION_MIN, ARTICLE_LIMITS.DESCRIPTION_MAX)
  description: string;

  @ApiProperty({
    example: 'You have to believe',
    minLength: ARTICLE_LIMITS.BODY_MIN,
    maxLength: ARTICLE_LIMITS.BODY_MAX,
  })
  @IsNotEmpty()
  @IsString()
  @Length(ARTICLE_LIMITS.BODY_MIN, ARTICLE_LIMITS.BODY_MAX)
  body: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['dragons', 'training'],
    maxItems: ARTICLE_LIMITS.TAG_LIST_MAX,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(ARTICLE_LIMITS.TAG_LIST_MAX)
  @IsString({ each: true })
  @Length(ARTICLE_LIMITS.TAG_MIN, ARTICLE_LIMITS.TAG_MAX, { each: true })
  tagList?: string[];
}
