import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../market/market.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

interface PortfolioItem {
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
}

interface PortfolioSummary {
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
}

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly marketService: MarketService,
  ) { }

  async findAll(userId: string): Promise<PortfolioItem[]> {
    return this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    userId: string,
    dto: CreatePortfolioDto,
  ): Promise<PortfolioItem> {
    const item = await this.prisma.portfolio.create({
      data: {
        userId,
        symbol: dto.symbol.toUpperCase(),
        name: dto.name,
        assetType: dto.assetType,
        amount: dto.amount,
        buyPrice: dto.buyPrice,
        currency: dto.currency || 'USD',
      },
    });

    this.logger.log(`Portfolio item created: ${dto.symbol} for user ${userId}`);

    return item;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdatePortfolioDto,
  ): Promise<PortfolioItem> {
    const existing = await this.prisma.portfolio.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Portfolio item not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.portfolio.update({
      where: { id },
      data: {
        ...(dto.symbol !== undefined && { symbol: dto.symbol.toUpperCase() }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.assetType !== undefined && { assetType: dto.assetType }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.buyPrice !== undefined && { buyPrice: dto.buyPrice }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
      },
    });

    this.logger.log(`Portfolio item updated: ${id}`);

    return updated;
  }

  async delete(userId: string, id: string): Promise<void> {
    const existing = await this.prisma.portfolio.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Portfolio item not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.portfolio.delete({
      where: { id },
    });

    this.logger.log(`Portfolio item deleted: ${id}`);
  }

  async getSummary(userId: string): Promise<PortfolioSummary> {
    const items = await this.prisma.portfolio.findMany({
      where: { userId },
    });

    if (items.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        holdings: [],
      };
    }

    const symbols = [...new Set(items.map((item: PortfolioItem) => item.symbol))] as string[];
    const prices = await this.marketService.getPrices(symbols);

    const priceMap = new Map<string, number>();
    for (const price of prices) {
      priceMap.set(price.symbol, price.price);
    }

    let totalValue = 0;
    let totalCost = 0;

    const holdings = items.map((item: PortfolioItem) => {
      const currentPrice = priceMap.get(item.symbol) || 0;
      const value = item.amount * currentPrice;
      const cost = item.amount * item.buyPrice;
      const pnl = value - cost;
      const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

      totalValue += value;
      totalCost += cost;

      return {
        id: item.id,
        symbol: item.symbol,
        name: item.name,
        assetType: item.assetType,
        amount: item.amount,
        buyPrice: item.buyPrice,
        currentPrice,
        value,
        cost,
        pnl,
        pnlPercent,
        currency: item.currency,
      };
    });

    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercent,
      holdings,
    };
  }

  async exportCsv(userId: string): Promise<string> {
    const summary = await this.getSummary(userId);

    const headers = [
      'Symbol',
      'Name',
      'Asset Type',
      'Amount',
      'Buy Price',
      'Current Price',
      'Value',
      'Cost',
      'P&L',
      'P&L %',
      'Currency',
    ].join(',');

    const rows = summary.holdings.map((h) =>
      [
        h.symbol,
        `"${h.name}"`,
        h.assetType,
        h.amount,
        h.buyPrice.toFixed(2),
        h.currentPrice.toFixed(2),
        h.value.toFixed(2),
        h.cost.toFixed(2),
        h.pnl.toFixed(2),
        h.pnlPercent.toFixed(2),
        h.currency,
      ].join(','),
    );

    const summaryRow = [
      'TOTAL',
      '',
      '',
      '',
      '',
      '',
      summary.totalValue.toFixed(2),
      summary.totalCost.toFixed(2),
      summary.totalPnL.toFixed(2),
      summary.totalPnLPercent.toFixed(2),
      '',
    ].join(',');

    return [headers, ...rows, summaryRow].join('\n');
  }
}
