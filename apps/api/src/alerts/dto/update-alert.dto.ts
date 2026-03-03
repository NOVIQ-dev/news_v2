import {
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAlertDto {
  @ApiPropertyOptional({
    description: 'Alert type',
    example: 'price',
    enum: ['price', 'volume', 'percent_change', 'news'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['price', 'volume', 'percent_change', 'news'])
  type?: string;

  @ApiPropertyOptional({
    description: 'Alert condition configuration',
  })
  @IsOptional()
  @IsObject()
  condition?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Custom alert message',
    example: 'BTC reached $50k!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiPropertyOptional({
    description: 'Whether the alert is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
