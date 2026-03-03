import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Economic Calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  @ApiOperation({ summary: 'Get economic calendar events with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Array of economic events',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          country: { type: 'string' },
          importance: { type: 'string', enum: ['low', 'medium', 'high'] },
          datetime: { type: 'string', format: 'date-time' },
          actual: { type: 'string', nullable: true },
          forecast: { type: 'string', nullable: true },
          previous: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEvents(
    @Query() query: CalendarQueryDto,
  ): Promise<
    Array<{
      id: string;
      title: string;
      description: string | null;
      country: string;
      importance: string;
      datetime: Date;
      actual: string | null;
      forecast: string | null;
      previous: string | null;
      createdAt: Date;
    }>
  > {
    return this.calendarService.getEvents(query);
  }
}
