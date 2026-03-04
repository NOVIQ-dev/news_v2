import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { NewsQueryDto } from './dto/news-query.dto';

interface RssSource {
  name: string;
  url: string;
  region: string;
  language: string;
}

interface NewsItem {
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
}

interface PaginatedNews {
  items: NewsItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RssItem {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  categories?: string[];
  enclosure?: { url?: string };
}

const RSS_SOURCES: RssSource[] = [
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    region: 'US',
    language: 'en',
  },
  {
    name: 'CoinTelegraph',
    url: 'https://cointelegraph.com/rss',
    region: 'US',
    language: 'en',
  },
  {
    name: 'The Block',
    url: 'https://www.theblock.co/rss.xml',
    region: 'US',
    language: 'en',
  },
  {
    name: 'Decrypt',
    url: 'https://decrypt.co/feed',
    region: 'US',
    language: 'en',
  },
  {
    name: 'Bitcoin Magazine',
    url: 'https://bitcoinmagazine.com/.rss/full/',
    region: 'US',
    language: 'en',
  },
  {
    name: 'Reuters Business',
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best',
    region: 'Global',
    language: 'en',
  },
  {
    name: 'Financial Times',
    url: 'https://www.ft.com/rss/home',
    region: 'UK',
    language: 'en',
  },
  {
    name: 'Bloomberg Crypto',
    url: 'https://www.bloomberg.com/feed/podcast/decrypted',
    region: 'US',
    language: 'en',
  },
];

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) { }

  getRssSources(): RssSource[] {
    return RSS_SOURCES;
  }

  async getNews(query: NewsQueryDto): Promise<PaginatedNews> {
    const { region, tags, language, page = 1, limit = 20 } = query;

    const cacheKey = `news:list:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<PaginatedNews>(cacheKey);

    if (cached) {
      return cached;
    }

    const where: Record<string, unknown> = {};

    if (region) {
      where.region = region;
    }

    if (language) {
      where.language = language;
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const [items, total] = await Promise.all([
      this.prisma.newsCache.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.newsCache.count({ where }),
    ]);

    const result: PaginatedNews = {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    await this.cacheService.set(cacheKey, result, 60); // 1 minute cache

    return result;
  }

  async getNewsById(id: string): Promise<NewsItem> {
    const cacheKey = `news:item:${id}`;
    const cached = await this.cacheService.get<NewsItem>(cacheKey);

    if (cached) {
      return cached;
    }

    const item = await this.prisma.newsCache.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('News article not found');
    }

    await this.cacheService.set(cacheKey, item, 300); // 5 minute cache

    return item;
  }

  async storeNewsItem(
    item: RssItem,
    source: RssSource,
  ): Promise<NewsItem | null> {
    if (!item.title || !item.link) {
      return null;
    }

    const hash = crypto
      .createHash('sha256')
      .update(`${item.title}:${item.link}`)
      .digest('hex');

    // Check deduplication via Redis
    const exists = await this.cacheService.hexists('news:hashes', hash);

    if (exists) {
      return null;
    }

    // Check database
    const existing = await this.prisma.newsCache.findUnique({
      where: { hash },
    });

    if (existing) {
      await this.cacheService.hset('news:hashes', hash, true);
      return null;
    }

    const tags = this.extractTags(item.title, item.contentSnippet || '');

    const newsItem = await this.prisma.newsCache.create({
      data: {
        hash,
        title: item.title,
        summary: item.contentSnippet?.substring(0, 500) || null,
        content: item.content || null,
        url: item.link,
        source: source.name,
        region: source.region,
        tags,
        language: source.language,
        imageUrl: item.enclosure?.url || null,
        publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
      },
    });

    // Mark as seen in Redis
    await this.cacheService.hset('news:hashes', hash, true);

    this.logger.log(`Stored news: ${item.title} from ${source.name}`);

    return newsItem;
  }

  async summarizeArticle(id: string): Promise<{ summary: string }> {
    const article = await this.getNewsById(id);

    if (article.summary && article.summary.length > 100) {
      return { summary: article.summary };
    }

    // Import Anthropic SDK dynamically for summarization
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    const anthropic = new Anthropic({ apiKey });

    const contentToSummarize = article.content || article.summary || article.title;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Summarize this financial news article in 2-3 concise sentences. Focus on the key facts and market implications:\n\nTitle: ${article.title}\n\nContent: ${contentToSummarize}`,
        },
      ],
    });

    const summaryBlock = response.content[0];
    const summary =
      summaryBlock && summaryBlock.type === 'text'
        ? (summaryBlock as { type: 'text'; text: string }).text
        : 'Unable to generate summary';

    // Update the article with the summary
    await this.prisma.newsCache.update({
      where: { id },
      data: { summary },
    });

    // Invalidate cache
    await this.cacheService.del(`news:item:${id}`);

    return { summary };
  }

  private extractTags(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const tagKeywords: Record<string, string[]> = {
      bitcoin: ['bitcoin', 'btc'],
      ethereum: ['ethereum', 'eth'],
      crypto: ['crypto', 'cryptocurrency', 'blockchain', 'defi', 'nft'],
      stocks: ['stock', 'equity', 'shares', 'nasdaq', 'dow', 's&p'],
      forex: ['forex', 'currency', 'dollar', 'euro', 'yen'],
      commodities: ['gold', 'silver', 'oil', 'commodity'],
      regulation: ['regulation', 'sec', 'cftc', 'regulatory', 'compliance'],
      macro: ['inflation', 'interest rate', 'fed', 'gdp', 'employment'],
      earnings: ['earnings', 'revenue', 'profit', 'quarterly'],
    };

    const tags: string[] = [];

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        tags.push(tag);
      }
    }

    return tags.length > 0 ? tags : ['general'];
  }
}
