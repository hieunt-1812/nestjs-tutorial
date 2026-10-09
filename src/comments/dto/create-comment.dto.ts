import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { COMMENT_LIMITS } from '../comments.constants';

export class CreateCommentDto {
  @ApiProperty({
    example: 'His name was my name too.',
    minLength: COMMENT_LIMITS.BODY_MIN,
    maxLength: COMMENT_LIMITS.BODY_MAX,
  })
  @IsNotEmpty()
  @IsString()
  @Length(COMMENT_LIMITS.BODY_MIN, COMMENT_LIMITS.BODY_MAX)
  body: string;
}
