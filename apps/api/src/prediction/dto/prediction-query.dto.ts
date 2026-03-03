import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PredictionQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by prediction category',
    example: 'crypto',
    enum: ['crypto', 'politics', 'sports', 'science', 'economics', 'culture'],
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'volume',
    enum: ['volume', 'newest', 'ending_soon', 'liquidity'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['volume', 'newest', 'ending_soon', 'liquidity'])
  sort?: string;
}
