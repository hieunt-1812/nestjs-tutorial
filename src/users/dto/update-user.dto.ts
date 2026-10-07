import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'johndoe' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'newpassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'I work at Statefarm' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    description: 'Image URL. Ignored when an avatar file is uploaded.',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
