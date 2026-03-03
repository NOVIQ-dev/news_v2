import { Controller, Get, Header, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MarketService } from './market.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Market')
@Controller('market')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('prices')
  @Header('Cache-Control', 'public, max-age=5')
  @ApiOperation({ summary: 'Get current prices for specified symbols' })
  @ApiQuery({
    name: 'symbols',
    description: 'Comma-separated list of asset symbols',
    example: 'BTC,ETH,GOLD',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Array of price data for requested symbols',
    schema: {
      type: 'array',
      items: {
        properties: {
          symbol: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          change24h: { type: 'number' },
          changePercent24h: { type: 'number' },
          high24h: { type: 'number' },
          low24h: { type: 'number' },
          volume24h: { type: 'number' },
          marketCap: { type: 'number' },
          lastUpdated: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPrices(
    @Query('symbols') symbols: string,
  ): Promise<
    Array<{
      symbol: string;
      name: string;
      price: number;
      change24h: number;
      changePercent24h: number;
      high24h: number;
      low24h: number;
      volume24h: number;
      marketCap: number;
      lastUpdated: string;
    }>
  > {
    const symbolList = symbols.split(',').map((s) => s.trim().toUpperCase());
    return this.marketService.getPrices(symbolList);
  }

  @Get('heatmap')
  @Header('Cache-Control', 'public, max-age=5')
  @ApiOperation({ summary: 'Get market heatmap data' })
  @ApiQuery({
    name: 'category',
    description: 'Filter by asset category',
    required: false,
    enum: ['crypto', 'stocks', 'commodities', 'forex'],
  })
  @ApiResponse({
    status: 200,
    description: 'Array of heatmap items',
    schema: {
      type: 'array',
      items: {
        properties: {
          symbol: { type: 'string' },
          name: { type: 'string' },
          changePercent24h: { type: 'number' },
          marketCap: { type: 'number' },
          volume24h: { type: 'number' },
          category: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getHeatmap(
    @Query('category') category?: string,
  ): Promise<
    Array<{
      symbol: string;
      name: string;
      changePercent24h: number;
      marketCap: number;
      volume24h: number;
      category: string;
    }>
  > {
    return this.marketService.getHeatmap(category);
  }

  @Get('asset/:symbol')
  @Header('Cache-Control', 'public, max-age=5')
  @ApiOperation({ summary: 'Get detailed information for a specific asset' })
  @ApiParam({
    name: 'symbol',
    description: 'Asset symbol',
    example: 'BTC',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed asset information',
    schema: {
      properties: {
        symbol: { type: 'string' },
        name: { type: 'string' },
        price: { type: 'number' },
        change24h: { type: 'number' },
        changePercent24h: { type: 'number' },
        high24h: { type: 'number' },
        low24h: { type: 'number' },
        volume24h: { type: 'number' },
        marketCap: { type: 'number' },
        lastUpdated: { type: 'string' },
        description: { type: 'string' },
        assetType: { type: 'string' },
        sparkline7d: { type: 'array', items: { type: 'number' } },
        allTimeHigh: { type: 'number' },
        allTimeLow: { type: 'number' },
        circulatingSupply: { type: 'number' },
        totalSupply: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAssetDetail(
    @Param('symbol') symbol: string,
  ): Promise<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    changePercent24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
    marketCap: number;
    lastUpdated: string;
    description: string;
    assetType: string;
    sparkline7d: number[];
    allTimeHigh: number;
    allTimeLow: number;
    circulatingSupply: number;
    totalSupply: number;
  }> {
    return this.marketService.getAssetDetail(symbol.toUpperCase());
  }
}
