import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'How to train your dragon' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Ever wonder how?' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'You have to believe' })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['dragons', 'training'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagList?: string[];
}
