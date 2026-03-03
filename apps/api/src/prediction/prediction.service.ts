import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';
import { PredictionQueryDto } from './dto/prediction-query.dto';

interface PredictionMarket {
  id: string;
  question: string;
  description: string;
  category: string;
  outcomes: PredictionOutcome[];
  volume: number;
  liquidity: number;
  endDate: string;
  status: string;
  source: string;
  url: string;
}

interface PredictionOutcome {
  name: string;
  probability: number;
  price: number;
}

interface PolymarketEvent {
  id: string;
  title: string;
  description: string;
  slug: string;
  end_date_iso: string;
  active: boolean;
  closed: boolean;
  markets: Array<{
    id: string;
    question: string;
    outcomePrices: string;
    outcomes: string;
    volume: string;
    liquidity: string;
  }>;
}

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);
  private readonly polymarketBaseUrl = 'https://gamma-api.polymarket.com';

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {}

  async getPredictions(query: PredictionQueryDto): Promise<PredictionMarket[]> {
    const cacheKey = `predictions:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<PredictionMarket[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const predictions = await this.fetchFromPolymarket(query);

    await this.cacheService.set(cacheKey, predictions, 60); // 1 minute cache

    return predictions;
  }

  private async fetchFromPolymarket(
    query: PredictionQueryDto,
  ): Promise<PredictionMarket[]> {
    try {
      const params = new URLSearchParams();
      params.append('limit', '50');
      params.append('active', 'true');
      params.append('closed', 'false');

      if (query.category) {
        params.append('tag', query.category);
      }

      if (query.sort === 'volume') {
        params.append('order', 'volume');
        params.append('ascending', 'false');
      } else if (query.sort === 'newest') {
        params.append('order', 'start_date_iso');
        params.append('ascending', 'false');
      } else if (query.sort === 'ending_soon') {
        params.append('order', 'end_date_iso');
        params.append('ascending', 'true');
      } else if (query.sort === 'liquidity') {
        params.append('order', 'liquidity');
        params.append('ascending', 'false');
      }

      const response = await fetch(
        `${this.polymarketBaseUrl}/events?${params.toString()}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        this.logger.warn(`Polymarket API returned ${response.status}`);
        return this.getFallbackPredictions();
      }

      const events = (await response.json()) as PolymarketEvent[];

      const predictions: PredictionMarket[] = [];

      for (const event of events) {
        for (const market of event.markets) {
          const outcomeNames = this.parseJsonSafely<string[]>(
            market.outcomes,
            ['Yes', 'No'],
          );
          const outcomePrices = this.parseJsonSafely<string[]>(
            market.outcomePrices,
            ['0.5', '0.5'],
          );

          const outcomes: PredictionOutcome[] = outcomeNames.map(
            (name, idx) => {
              const price = parseFloat(outcomePrices[idx] || '0.5');
              return {
                name,
                probability: price * 100,
                price,
              };
            },
          );

          predictions.push({
            id: market.id,
            question: market.question || event.title,
            description: event.description || '',
            category: this.categorizeEvent(event.title, event.description),
            outcomes,
            volume: parseFloat(market.volume || '0'),
            liquidity: parseFloat(market.liquidity || '0'),
            endDate: event.end_date_iso,
            status: event.active ? 'active' : 'closed',
            source: 'Polymarket',
            url: `https://polymarket.com/event/${event.slug}`,
          });
        }
      }

      // Apply category filter post-fetch if needed
      if (query.category) {
        return predictions.filter(
          (p) => p.category.toLowerCase() === query.category?.toLowerCase(),
        );
      }

      return predictions;
    } catch (error) {
      this.logger.error(
        `Failed to fetch from Polymarket: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return this.getFallbackPredictions();
    }
  }

  private categorizeEvent(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    if (
      text.includes('bitcoin') ||
      text.includes('crypto') ||
      text.includes('ethereum') ||
      text.includes('token')
    ) {
      return 'crypto';
    }
    if (
      text.includes('election') ||
      text.includes('president') ||
      text.includes('congress') ||
      text.includes('vote')
    ) {
      return 'politics';
    }
    if (
      text.includes('fed') ||
      text.includes('inflation') ||
      text.includes('gdp') ||
      text.includes('recession')
    ) {
      return 'economics';
    }
    if (
      text.includes('game') ||
      text.includes('championship') ||
      text.includes('super bowl')
    ) {
      return 'sports';
    }
    if (
      text.includes('ai') ||
      text.includes('climate') ||
      text.includes('space')
    ) {
      return 'science';
    }

    return 'culture';
  }

  private parseJsonSafely<T>(value: string, fallback: T): T {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  private getFallbackPredictions(): PredictionMarket[] {
    return [
      {
        id: 'fallback-1',
        question: 'Will Bitcoin exceed $100,000 by end of 2026?',
        description: 'Resolves YES if BTC/USD exceeds $100,000 at any point before December 31, 2026.',
        category: 'crypto',
        outcomes: [
          { name: 'Yes', probability: 65, price: 0.65 },
          { name: 'No', probability: 35, price: 0.35 },
        ],
        volume: 5000000,
        liquidity: 1200000,
        endDate: '2026-12-31T23:59:59Z',
        status: 'active',
        source: 'Polymarket',
        url: 'https://polymarket.com',
      },
      {
        id: 'fallback-2',
        question: 'Will the Fed cut rates in Q2 2026?',
        description: 'Resolves YES if the Federal Reserve reduces the federal funds rate during Q2 2026.',
        category: 'economics',
        outcomes: [
          { name: 'Yes', probability: 42, price: 0.42 },
          { name: 'No', probability: 58, price: 0.58 },
        ],
        volume: 3200000,
        liquidity: 800000,
        endDate: '2026-06-30T23:59:59Z',
        status: 'active',
        source: 'Polymarket',
        url: 'https://polymarket.com',
      },
    ];
  }
}
