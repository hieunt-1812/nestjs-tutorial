import { IsOptional, IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ARTICLE_LIMITS } from '../articles.constants';

export class UpdateArticleDto {
  @ApiPropertyOptional({
    example: 'How to train your dragon (revised)',
    minLength: ARTICLE_LIMITS.TITLE_MIN,
    maxLength: ARTICLE_LIMITS.TITLE_MAX,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(ARTICLE_LIMITS.TITLE_MIN, ARTICLE_LIMITS.TITLE_MAX)
  title?: string;

  @ApiPropertyOptional({
    example: 'A new description',
    minLength: ARTICLE_LIMITS.DESCRIPTION_MIN,
    maxLength: ARTICLE_LIMITS.DESCRIPTION_MAX,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(ARTICLE_LIMITS.DESCRIPTION_MIN, ARTICLE_LIMITS.DESCRIPTION_MAX)
  description?: string;

  @ApiPropertyOptional({
    example: 'Updated body content',
    minLength: ARTICLE_LIMITS.BODY_MIN,
    maxLength: ARTICLE_LIMITS.BODY_MAX,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(ARTICLE_LIMITS.BODY_MIN, ARTICLE_LIMITS.BODY_MAX)
  body?: string;
}
