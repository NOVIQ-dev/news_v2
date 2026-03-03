import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AiService } from './ai.service';
import { AnalyzeDto } from './dto/analyze.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('AI Analysis')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Analyze market data using AI (Server-Sent Events stream)',
  })
  @ApiBody({ type: AnalyzeDto })
  @ApiResponse({
    status: 200,
    description: 'SSE stream of analysis chunks',
    content: {
      'text/event-stream': {
        schema: {
          type: 'string',
          description: 'Server-Sent Events stream with JSON data chunks',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async analyze(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AnalyzeDto,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      for await (const chunk of this.aiService.analyzeStream(user.sub, dto)) {
        const data = JSON.stringify(chunk);
        res.write(`data: ${data}\n\n`);

        if (chunk.type === 'done' || chunk.type === 'error') {
          break;
        }
      }
    } catch (error) {
      const errorData = JSON.stringify({
        type: 'error',
        content: error instanceof Error ? error.message : 'Stream failed',
      });
      res.write(`data: ${errorData}\n\n`);
    }

    res.end();
  }

  @Get('chats')
  @ApiOperation({ summary: 'Get all AI chat sessions for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Array of chat sessions',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          title: { type: 'string', nullable: true },
          messages: { type: 'array' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getChats(
    @CurrentUser() user: JwtPayload,
  ): Promise<
    Array<{
      id: string;
      userId: string;
      title: string | null;
      messages: unknown;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    return this.aiService.getChats(user.sub);
  }

  @Get('chats/:id')
  @ApiOperation({ summary: 'Get a specific AI chat session' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({
    status: 200,
    description: 'Chat session with messages',
    schema: {
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        title: { type: 'string', nullable: true },
        messages: { type: 'array' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getChatById(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{
    id: string;
    userId: string;
    title: string | null;
    messages: unknown;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.aiService.getChatById(user.sub, id);
  }

  @Delete('chats/:id')
  @ApiOperation({ summary: 'Delete an AI chat session' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 200, description: 'Chat deleted successfully' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteChat(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.aiService.deleteChat(user.sub, id);
    return { message: 'Chat deleted successfully' };
  }
}
