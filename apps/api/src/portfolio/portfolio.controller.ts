import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Portfolio')
@Controller('portfolio')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'Get all portfolio items for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Array of portfolio items',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          symbol: { type: 'string' },
          name: { type: 'string' },
          assetType: { type: 'string' },
          amount: { type: 'number' },
          buyPrice: { type: 'number' },
          currency: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<
    Array<{
      id: string;
      userId: string;
      symbol: string;
      name: string;
      assetType: string;
      amount: number;
      buyPrice: number;
      currency: string;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    return this.portfolioService.findAll(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new asset to the portfolio' })
  @ApiBody({ type: CreatePortfolioDto })
  @ApiResponse({
    status: 201,
    description: 'Portfolio item created successfully',
    schema: {
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        symbol: { type: 'string' },
        name: { type: 'string' },
        assetType: { type: 'string' },
        amount: { type: 'number' },
        buyPrice: { type: 'number' },
        currency: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePortfolioDto,
  ): Promise<{
    id: string;
    userId: string;
    symbol: string;
    name: string;
    assetType: string;
    amount: number;
    buyPrice: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.portfolioService.create(user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a portfolio item' })
  @ApiParam({ name: 'id', description: 'Portfolio item ID' })
  @ApiBody({ type: UpdatePortfolioDto })
  @ApiResponse({
    status: 200,
    description: 'Portfolio item updated successfully',
    schema: {
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        symbol: { type: 'string' },
        name: { type: 'string' },
        assetType: { type: 'string' },
        amount: { type: 'number' },
        buyPrice: { type: 'number' },
        currency: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Portfolio item not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePortfolioDto,
  ): Promise<{
    id: string;
    userId: string;
    symbol: string;
    name: string;
    assetType: string;
    amount: number;
    buyPrice: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.portfolioService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a portfolio item' })
  @ApiParam({ name: 'id', description: 'Portfolio item ID' })
  @ApiResponse({ status: 200, description: 'Portfolio item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Portfolio item not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.portfolioService.delete(user.sub, id);
    return { message: 'Portfolio item deleted successfully' };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get portfolio summary with total P&L calculations' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio summary with holdings and P&L',
    schema: {
      properties: {
        totalValue: { type: 'number' },
        totalCost: { type: 'number' },
        totalPnL: { type: 'number' },
        totalPnLPercent: { type: 'number' },
        holdings: {
          type: 'array',
          items: {
            properties: {
              id: { type: 'string' },
              symbol: { type: 'string' },
              name: { type: 'string' },
              assetType: { type: 'string' },
              amount: { type: 'number' },
              buyPrice: { type: 'number' },
              currentPrice: { type: 'number' },
              value: { type: 'number' },
              cost: { type: 'number' },
              pnl: { type: 'number' },
              pnlPercent: { type: 'number' },
              currency: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSummary(
    @CurrentUser() user: JwtPayload,
  ): Promise<{
    totalValue: number;
    totalCost: number;
    totalPnL: number;
    totalPnLPercent: number;
    holdings: Array<{
      id: string;
      symbol: string;
      name: string;
      assetType: string;
      amount: number;
      buyPrice: number;
      currentPrice: number;
      value: number;
      cost: number;
      pnl: number;
      pnlPercent: number;
      currency: string;
    }>;
  }> {
    return this.portfolioService.getSummary(user.sub);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export portfolio data as CSV' })
  @ApiQuery({
    name: 'format',
    description: 'Export format',
    enum: ['csv'],
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'CSV file download',
    content: { 'text/csv': {} },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=portfolio.csv')
  async exportCsv(
    @CurrentUser() user: JwtPayload,
    @Query('format') _format?: string,
    @Res({ passthrough: true }) _res?: Response,
  ): Promise<string> {
    return this.portfolioService.exportCsv(user.sub);
  }
}
