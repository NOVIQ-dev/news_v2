import {
  Controller,
  Get,
  Header,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NewsService } from './news.service';
import { NewsQueryDto } from './dto/news-query.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('News')
@Controller('news')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  @ApiOperation({ summary: 'Get paginated news articles with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of news articles',
    schema: {
      properties: {
        items: {
          type: 'array',
          items: {
            properties: {
              id: { type: 'string' },
              hash: { type: 'string' },
              title: { type: 'string' },
              summary: { type: 'string', nullable: true },
              content: { type: 'string', nullable: true },
              url: { type: 'string' },
              source: { type: 'string' },
              region: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              language: { type: 'string' },
              imageUrl: { type: 'string', nullable: true },
              publishedAt: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getNews(
    @Query() query: NewsQueryDto,
  ): Promise<{
    items: Array<{
      id: string;
      hash: string;
      title: string;
      summary: string | null;
      content: string | null;
      url: string;
      source: string;
      region: string;
      tags: string[];
      language: string;
      imageUrl: string | null;
      publishedAt: Date;
      createdAt: Date;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.newsService.getNews(query);
  }

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=60')
  @ApiOperation({ summary: 'Get a specific news article by ID' })
  @ApiParam({ name: 'id', description: 'News article ID' })
  @ApiResponse({
    status: 200,
    description: 'News article details',
    schema: {
      properties: {
        id: { type: 'string' },
        hash: { type: 'string' },
        title: { type: 'string' },
        summary: { type: 'string', nullable: true },
        content: { type: 'string', nullable: true },
        url: { type: 'string' },
        source: { type: 'string' },
        region: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        language: { type: 'string' },
        imageUrl: { type: 'string', nullable: true },
        publishedAt: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getNewsById(
    @Param('id') id: string,
  ): Promise<{
    id: string;
    hash: string;
    title: string;
    summary: string | null;
    content: string | null;
    url: string;
    source: string;
    region: string;
    tags: string[];
    language: string;
    imageUrl: string | null;
    publishedAt: Date;
    createdAt: Date;
  }> {
    return this.newsService.getNewsById(id);
  }

  @Post(':id/summarize')
  @ApiOperation({ summary: 'Generate AI summary for a news article' })
  @ApiParam({ name: 'id', description: 'News article ID' })
  @ApiResponse({
    status: 201,
    description: 'AI-generated summary',
    schema: {
      properties: {
        summary: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async summarizeArticle(
    @Param('id') id: string,
  ): Promise<{ summary: string }> {
    return this.newsService.summarizeArticle(id);
  }
}
