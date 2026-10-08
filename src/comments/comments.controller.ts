import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { OptionalJwtAuthGuard } from '../profiles/guards/optional-jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Comments')
@Controller('articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiParam({ name: 'slug', example: 'how-to-train-your-dragon-x8f2k1' })
  @ApiOperation({ summary: 'Thêm bình luận cho bài viết' })
  @ApiResponse({ status: 201, description: 'Tạo bình luận thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết.' })
  create(
    @Param('slug') slug: string,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.commentsService.create(slug, dto, req.user.id);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'slug', example: 'how-to-train-your-dragon-x8f2k1' })
  @ApiOperation({
    summary: 'Lấy danh sách bình luận của bài viết (xác thực tùy chọn)',
  })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bình luận.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết.' })
  findAll(@Param('slug') slug: string, @Request() req: any) {
    return this.commentsService.findByArticle(slug, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'slug', example: 'how-to-train-your-dragon-x8f2k1' })
  @ApiParam({ name: 'id', description: 'ID của bình luận' })
  @ApiOperation({ summary: 'Xóa bình luận (chỉ tác giả bình luận)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 403, description: 'Không phải tác giả bình luận.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bình luận.' })
  remove(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.commentsService.remove(slug, id, req.user.id);
  }
}
