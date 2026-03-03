import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsProcessor } from './news.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'news',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),
  ],
  controllers: [NewsController],
  providers: [NewsService, NewsProcessor],
  exports: [NewsService],
})
export class NewsModule {}
