import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarketPricesQueryDto {
  @ApiProperty({
    description: 'Comma-separated list of symbols',
    example: 'BTC,ETH,GOLD',
  })
  @IsString()
  symbols: string;
}

export class AssetParamDto {
  @ApiProperty({
    description: 'Asset symbol',
    example: 'BTC',
  })
  @IsString()
  symbol: string;
}

export class HeatmapQueryDto {
  @ApiPropertyOptional({
    description: 'Asset category filter',
    example: 'crypto',
    enum: ['crypto', 'stocks', 'commodities', 'forex'],
  })
  @IsOptional()
  @IsString()
  category?: string;
}
