import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all alerts for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Array of alerts',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string' },
          condition: { type: 'object' },
          message: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          lastTriggered: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<
    Array<{
      id: string;
      userId: string;
      type: string;
      condition: unknown;
      message: string | null;
      isActive: boolean;
      lastTriggered: Date | null;
      createdAt: Date;
    }>
  > {
    return this.alertsService.findAll(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new price alert' })
  @ApiBody({ type: CreateAlertDto })
  @ApiResponse({
    status: 201,
    description: 'Alert created successfully',
    schema: {
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        type: { type: 'string' },
        condition: { type: 'object' },
        message: { type: 'string', nullable: true },
        isActive: { type: 'boolean' },
        lastTriggered: { type: 'string', format: 'date-time', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAlertDto,
  ): Promise<{
    id: string;
    userId: string;
    type: string;
    condition: unknown;
    message: string | null;
    isActive: boolean;
    lastTriggered: Date | null;
    createdAt: Date;
  }> {
    return this.alertsService.create(user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiBody({ type: UpdateAlertDto })
  @ApiResponse({
    status: 200,
    description: 'Alert updated successfully',
    schema: {
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        type: { type: 'string' },
        condition: { type: 'object' },
        message: { type: 'string', nullable: true },
        isActive: { type: 'boolean' },
        lastTriggered: { type: 'string', format: 'date-time', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAlertDto,
  ): Promise<{
    id: string;
    userId: string;
    type: string;
    condition: unknown;
    message: string | null;
    isActive: boolean;
    lastTriggered: Date | null;
    createdAt: Date;
  }> {
    return this.alertsService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert deleted successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.alertsService.delete(user.sub, id);
    return { message: 'Alert deleted successfully' };
  }
}
