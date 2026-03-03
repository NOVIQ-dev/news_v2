import { IsString, IsNumber, IsOptional, IsPositive, MaxLength, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePortfolioDto {
  @ApiPropertyOptional({
    description: 'Asset symbol',
    example: 'BTC',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  symbol?: string;

  @ApiPropertyOptional({
    description: 'Asset name',
    example: 'Bitcoin',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Type of asset',
    example: 'crypto',
    enum: ['crypto', 'stock', 'commodity', 'forex', 'etf', 'bond'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['crypto', 'stock', 'commodity', 'forex', 'etf', 'bond'])
  assetType?: string;

  @ApiPropertyOptional({
    description: 'Amount of asset held',
    example: 2.0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Buy price per unit',
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  buyPrice?: number;

  @ApiPropertyOptional({
    description: 'Currency',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;
}
