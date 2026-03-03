import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HealthIndicatorResult,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health status' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      properties: {
        status: { type: 'string', example: 'ok' },
        info: { type: 'object' },
        error: { type: 'object' },
        details: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database health check
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return {
            database: {
              status: 'up',
            },
          };
        } catch {
          return {
            database: {
              status: 'down',
            },
          };
        }
      },

      // Redis health check
      async (): Promise<HealthIndicatorResult> => {
        try {
          const client = this.cacheService.getClient();
          await client.ping();
          return {
            redis: {
              status: 'up',
            },
          };
        } catch {
          return {
            redis: {
              status: 'down',
            },
          };
        }
      },

      // Disk health check (threshold: 90% usage)
      (): Promise<HealthIndicatorResult> =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.9,
        }),

      // Memory health check (threshold: 500MB heap)
      (): Promise<HealthIndicatorResult> =>
        this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),

      // Memory RSS check (threshold: 1GB)
      (): Promise<HealthIndicatorResult> =>
        this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),
    ]);
  }
}
