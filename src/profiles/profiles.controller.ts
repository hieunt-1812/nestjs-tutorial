import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProfilesService } from './profiles.service';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'username', example: 'johndoe' })
  @ApiOperation({
    summary: 'Lấy profile của user (xác thực tùy chọn)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Trả về profile. `following` = true nếu user hiện tại đang theo dõi.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  getProfile(@Param('username') username: string, @Request() req: any) {
    return this.profilesService.getProfile(username, req.user?.id);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiParam({ name: 'username', example: 'johndoe' })
  @ApiOperation({ summary: 'Theo dõi một user' })
  @ApiResponse({ status: 201, description: 'Theo dõi thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  follow(@Param('username') username: string, @Request() req: any) {
    return this.profilesService.follow(username, req.user.id);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'username', example: 'johndoe' })
  @ApiOperation({ summary: 'Bỏ theo dõi một user' })
  @ApiResponse({ status: 200, description: 'Bỏ theo dõi thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  unfollow(@Param('username') username: string, @Request() req: any) {
    return this.profilesService.unfollow(username, req.user.id);
  }
}
