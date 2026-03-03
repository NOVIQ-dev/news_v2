import {
  IsString,
  IsOptional,
  IsIn,
  IsUrl,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Display name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Preferred language',
    example: 'en',
    enum: ['en', 'ar', 'es', 'fr', 'de', 'zh', 'ja'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'ar', 'es', 'fr', 'de', 'zh', 'ja'])
  language?: string;

  @ApiPropertyOptional({
    description: 'UI theme preference',
    example: 'dark',
    enum: ['dark', 'light', 'system'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['dark', 'light', 'system'])
  theme?: string;

  @ApiPropertyOptional({
    description: 'Custom dashboard layout configuration',
    example: { layout: 'grid', widgets: ['portfolio', 'news', 'market'] },
  })
  @IsOptional()
  @IsObject()
  dashboardLayout?: Record<string, unknown>;
}
