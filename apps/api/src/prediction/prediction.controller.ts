import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PredictionService } from './prediction.service';
import { PredictionQueryDto } from './dto/prediction-query.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Predictions')
@Controller('predictions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Get()
  @ApiOperation({
    summary: 'Get prediction market data from Polymarket',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of prediction markets',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          question: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          outcomes: {
            type: 'array',
            items: {
              properties: {
                name: { type: 'string' },
                probability: { type: 'number' },
                price: { type: 'number' },
              },
            },
          },
          volume: { type: 'number' },
          liquidity: { type: 'number' },
          endDate: { type: 'string' },
          status: { type: 'string' },
          source: { type: 'string' },
          url: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPredictions(
    @Query() query: PredictionQueryDto,
  ): Promise<
    Array<{
      id: string;
      question: string;
      description: string;
      category: string;
      outcomes: Array<{
        name: string;
        probability: number;
        price: number;
      }>;
      volume: number;
      liquidity: number;
      endDate: string;
      status: string;
      source: string;
      url: string;
    }>
  > {
    return this.predictionService.getPredictions(query);
  }
}
