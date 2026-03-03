import { IsString, IsOptional, MaxLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeDto {
  @ApiProperty({
    description: 'User message / analysis prompt',
    example: 'Analyze the current BTC market trend and suggest an entry point',
  })
  @IsString()
  @MaxLength(4000)
  message: string;

  @ApiPropertyOptional({
    description: 'Chat ID for continuing a conversation',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  @IsOptional()
  @IsString()
  chatId?: string;

  @ApiPropertyOptional({
    description: 'Symbols to include as context',
    example: ['BTC', 'ETH'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symbols?: string[];
}
