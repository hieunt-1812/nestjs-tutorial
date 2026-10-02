import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin User hiện tại' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin user.' })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập (thiếu hoặc sai Token).',
  })
  getCurrentUser(@Request() req: any) {
    return { user: req.user };
  }
}
