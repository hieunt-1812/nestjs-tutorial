import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { ArticlesService } from './articles.service';
import { OptionalJwtAuthGuard } from '../profiles/guards/optional-jwt-auth.guard';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { FeedArticlesQueryDto } from './dto/feed-articles-query.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  @ApiResponse({ status: 201, description: 'Tạo bài viết thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  create(@Body() dto: CreateArticleDto, @Request() req: any) {
    return this.articlesService.create(dto, req.user.id);
  }

  @Get('feed')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy feed bài viết của những user đang theo dõi',
  })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bài viết.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  feed(@Query() query: FeedArticlesQueryDto, @Request() req: any) {
    return this.articlesService.feed(query, req.user.id);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách bài viết (xác thực tùy chọn)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bài viết.' })
  list(@Query() query: ListArticlesQueryDto, @Request() req: any) {
    return this.articlesService.list(query, req.user?.id);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'slug', example: 'how-to-train-your-dragon-x8f2k1' })
  @ApiOperation({ summary: 'Lấy chi tiết bài viết (xác thực tùy chọn)' })
  @ApiResponse({ status: 200, description: 'Trả về chi tiết bài viết.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết.' })
  findOne(@Param('slug') slug: string, @Request() req: any) {
    return this.articlesService.findBySlug(slug, req.user?.id);
  }

  @Put(':slug')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiParam({ name: 'slug', example: 'how-to-train-your-dragon-x8f2k1' })
  @ApiOperation({ summary: 'Cập nhật bài viết (chỉ tác giả)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 403, description: 'Không phải tác giả bài viết.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết.' })
  update(
    @Param('slug') slug: string,
    @Body() dto: UpdateArticleDto,
    @Request() req: any,
  ) {
    return this.articlesService.update(slug, dto, req.user.id);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'slug', example: 'how-to-train-your-dragon-x8f2k1' })
  @ApiOperation({ summary: 'Xóa bài viết (chỉ tác giả)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 403, description: 'Không phải tác giả bài viết.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết.' })
  remove(@Param('slug') slug: string, @Request() req: any) {
    return this.articlesService.remove(slug, req.user.id);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiParam({ name: 'slug', example: 'how-to-train-your-dragon-x8f2k1' })
  @ApiOperation({ summary: 'Yêu thích bài viết' })
  @ApiResponse({ status: 201, description: 'Yêu thích thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết.' })
  favorite(@Param('slug') slug: string, @Request() req: any) {
    return this.articlesService.favorite(slug, req.user.id);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'slug', example: 'how-to-train-your-dragon-x8f2k1' })
  @ApiOperation({ summary: 'Bỏ yêu thích bài viết' })
  @ApiResponse({ status: 200, description: 'Bỏ yêu thích thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết.' })
  unfavorite(@Param('slug') slug: string, @Request() req: any) {
    return this.articlesService.unfavorite(slug, req.user.id);
  }
}
