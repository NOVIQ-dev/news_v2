import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import Parser from 'rss-parser';
import { NewsService } from './news.service';

interface RssFeedItem {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  categories?: string[];
  enclosure?: { url?: string };
}

interface RssSource {
  name: string;
  url: string;
  region: string;
  language: string;
}

@Processor('news')
export class NewsProcessor {
  private readonly logger = new Logger(NewsProcessor.name);
  private readonly parser: Parser;

  constructor(private readonly newsService: NewsService) {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'Fintelligence News Aggregator/1.0',
      },
    });
  }

  @Process('aggregate')
  async handleAggregate(job: Job<{ source?: RssSource }>): Promise<{
    processed: number;
    stored: number;
    source: string;
  }> {
    const sources = job.data.source
      ? [job.data.source]
      : this.newsService.getRssSources();

    let totalProcessed = 0;
    let totalStored = 0;

    for (const source of sources) {
      try {
        const result = await this.processSource(source);
        totalProcessed += result.processed;
        totalStored += result.stored;
      } catch (error) {
        this.logger.error(
          `Failed to process ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    this.logger.log(
      `News aggregation complete: ${totalProcessed} processed, ${totalStored} stored`,
    );

    return {
      processed: totalProcessed,
      stored: totalStored,
      source: sources.map((s) => s.name).join(', '),
    };
  }

  @Process('aggregate-single')
  async handleAggregateSingle(job: Job<{ source: RssSource }>): Promise<{
    processed: number;
    stored: number;
    source: string;
  }> {
    const { source } = job.data;

    try {
      const result = await this.processSource(source);

      this.logger.log(
        `${source.name}: ${result.processed} processed, ${result.stored} stored`,
      );

      return {
        processed: result.processed,
        stored: result.stored,
        source: source.name,
      };
    } catch (error) {
      this.logger.error(
        `Failed to process ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      return {
        processed: 0,
        stored: 0,
        source: source.name,
      };
    }
  }

  private async processSource(
    source: RssSource,
  ): Promise<{ processed: number; stored: number }> {
    this.logger.log(`Fetching RSS feed from ${source.name}: ${source.url}`);

    const feed = await this.parser.parseURL(source.url);
    let stored = 0;

    for (const item of feed.items as RssFeedItem[]) {
      const result = await this.newsService.storeNewsItem(
        {
          title: item.title,
          link: item.link,
          contentSnippet: item.contentSnippet,
          content: item.content,
          isoDate: item.isoDate,
          categories: item.categories,
          enclosure: item.enclosure,
        },
        source,
      );

      if (result) {
        stored++;
      }
    }

    return {
      processed: feed.items.length,
      stored,
    };
  }
}
