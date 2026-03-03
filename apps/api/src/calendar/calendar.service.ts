import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CalendarQueryDto } from './dto/calendar-query.dto';

interface EconomicEventItem {
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
}

interface EconomicCalendarApiEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
  actual?: string;
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getEvents(query: CalendarQueryDto): Promise<EconomicEventItem[]> {
    const cacheKey = `calendar:events:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<EconomicEventItem[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const where: Record<string, unknown> = {
      datetime: {
        gte: query.from ? new Date(query.from) : defaultFrom,
        lte: query.to ? new Date(query.to) : defaultTo,
      },
    };

    if (query.importance) {
      where.importance = query.importance;
    }

    if (query.country) {
      where.country = query.country;
    }

    const events = await this.prisma.economicEvent.findMany({
      where,
      orderBy: { datetime: 'asc' },
    });

    // If no events in database, try to fetch and seed
    if (events.length === 0) {
      const fetched = await this.fetchAndSeedEvents(query);
      if (fetched.length > 0) {
        await this.cacheService.set(cacheKey, fetched, 300); // 5 min cache
        return fetched;
      }
    }

    await this.cacheService.set(cacheKey, events, 300);

    return events;
  }

  async fetchAndSeedEvents(
    query: CalendarQueryDto,
  ): Promise<EconomicEventItem[]> {
    try {
      // Attempt to fetch from a public economic calendar API
      const response = await fetch(
        'https://nfs.faireconomy.media/ff_calendar_thisweek.json',
      );

      if (!response.ok) {
        this.logger.warn(`Economic calendar API returned ${response.status}`);
        return this.getDefaultEvents();
      }

      const data = (await response.json()) as EconomicCalendarApiEvent[];

      const events: EconomicEventItem[] = [];

      for (const item of data) {
        const importance = this.mapImpact(item.impact);

        if (query.importance && importance !== query.importance) {
          continue;
        }

        if (query.country && item.country !== query.country) {
          continue;
        }

        const event = await this.prisma.economicEvent.create({
          data: {
            title: item.title,
            description: null,
            country: item.country,
            importance,
            datetime: new Date(item.date),
            actual: item.actual || null,
            forecast: item.forecast || null,
            previous: item.previous || null,
          },
        });

        events.push(event);
      }

      this.logger.log(`Seeded ${events.length} economic events`);

      return events;
    } catch (error) {
      this.logger.error(
        `Failed to fetch economic events: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return this.getDefaultEvents();
    }
  }

  private mapImpact(impact: string): string {
    switch (impact?.toLowerCase()) {
      case 'high':
      case 'holiday':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
      default:
        return 'low';
    }
  }

  private getDefaultEvents(): EconomicEventItem[] {
    const now = new Date();
    return [
      {
        id: 'default-1',
        title: 'Federal Reserve Interest Rate Decision',
        description: 'FOMC announces interest rate decision',
        country: 'US',
        importance: 'high',
        datetime: new Date(now.getFullYear(), now.getMonth(), 15),
        actual: null,
        forecast: null,
        previous: null,
        createdAt: now,
      },
      {
        id: 'default-2',
        title: 'US Non-Farm Payrolls',
        description: 'Monthly employment report',
        country: 'US',
        importance: 'high',
        datetime: new Date(now.getFullYear(), now.getMonth(), 7),
        actual: null,
        forecast: null,
        previous: null,
        createdAt: now,
      },
      {
        id: 'default-3',
        title: 'Consumer Price Index (CPI)',
        description: 'Monthly inflation data release',
        country: 'US',
        importance: 'high',
        datetime: new Date(now.getFullYear(), now.getMonth(), 12),
        actual: null,
        forecast: null,
        previous: null,
        createdAt: now,
      },
    ];
  }
}
