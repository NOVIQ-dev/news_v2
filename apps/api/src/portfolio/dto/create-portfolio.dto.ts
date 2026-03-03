import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @ApiProperty({
    description: 'Asset symbol',
    example: 'BTC',
  })
  @IsString()
  @MaxLength(20)
  symbol: string;

  @ApiProperty({
    description: 'Asset name',
    example: 'Bitcoin',
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Type of asset',
    example: 'crypto',
    enum: ['crypto', 'stock', 'commodity', 'forex', 'etf', 'bond'],
  })
  @IsString()
  @IsIn(['crypto', 'stock', 'commodity', 'forex', 'etf', 'bond'])
  assetType: string;

  @ApiProperty({
    description: 'Amount of asset held',
    example: 1.5,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Buy price per unit',
    example: 45000,
  })
  @IsNumber()
  @IsPositive()
  buyPrice: number;

  @ApiPropertyOptional({
    description: 'Currency',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;
}
