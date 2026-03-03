import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import * as Joi from 'joi';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MarketModule } from './market/market.module';
import { NewsModule } from './news/news.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AlertsModule } from './alerts/alerts.module';
import { AiModule } from './ai/ai.module';
import { CalendarModule } from './calendar/calendar.module';
import { PredictionModule } from './prediction/prediction.module';
import { HealthModule } from './health/health.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        API_PORT: Joi.number().default(3001),
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().default('refresh-fallback-secret'),
        ANTHROPIC_API_KEY: Joi.string().required(),
        COINGECKO_API_KEY: Joi.string().allow('').default(''),
        ALPHA_VANTAGE_API_KEY: Joi.string().allow('').default(''),
        POLYMARKET_API_KEY: Joi.string().allow('').default(''),
      }),
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    PrismaModule,
    CacheModule,
    AuthModule,
    UsersModule,
    MarketModule,
    NewsModule,
    PortfolioModule,
    AlertsModule,
    AiModule,
    CalendarModule,
    PredictionModule,
    HealthModule,
    WebsocketModule,
  ],
})
export class AppModule {}
