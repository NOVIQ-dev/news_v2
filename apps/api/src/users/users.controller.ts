import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    schema: {
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        displayName: { type: 'string', nullable: true },
        avatarUrl: { type: 'string', nullable: true },
        language: { type: 'string' },
        theme: { type: 'string' },
        dashboardLayout: { type: 'object', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(
    @CurrentUser() user: JwtPayload,
  ): Promise<{
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    language: string;
    theme: string;
    dashboardLayout: unknown;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.usersService.findById(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile and preferences' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    schema: {
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        displayName: { type: 'string', nullable: true },
        avatarUrl: { type: 'string', nullable: true },
        language: { type: 'string' },
        theme: { type: 'string' },
        dashboardLayout: { type: 'object', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<{
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    language: string;
    theme: string;
    dashboardLayout: unknown;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.usersService.update(user.sub, dto);
  }
}
