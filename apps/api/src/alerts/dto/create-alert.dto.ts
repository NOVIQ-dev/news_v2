import { IsString, IsOptional, IsObject, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AlertCondition {
  @ApiProperty({
    description: 'Asset symbol to monitor',
    example: 'BTC',
  })
  @IsString()
  symbol!: string;

  @ApiProperty({
    description: 'Comparison operator',
    example: 'above',
    enum: ['above', 'below', 'crosses_above', 'crosses_below', 'percent_change'],
  })
  @IsString()
  @IsIn(['above', 'below', 'crosses_above', 'crosses_below', 'percent_change'])
  operator!: string;

  @ApiProperty({
    description: 'Threshold value',
    example: 50000,
  })
  value!: number;
}

export class CreateAlertDto {
  @ApiProperty({
    description: 'Alert type',
    example: 'price',
    enum: ['price', 'volume', 'percent_change', 'news'],
  })
  @IsString()
  @IsIn(['price', 'volume', 'percent_change', 'news'])
  type!: string;

  @ApiProperty({
    description: 'Alert condition configuration',
    type: AlertCondition,
  })
  @IsObject()
  condition!: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Custom alert message',
    example: 'BTC reached $50k!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
