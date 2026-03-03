import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertsProcessor } from './alerts.processor';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'alerts',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    }),
    MarketModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsProcessor],
  exports: [AlertsService],
})
export class AlertsModule {}
