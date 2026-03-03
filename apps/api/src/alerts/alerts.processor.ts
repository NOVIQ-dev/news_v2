import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AlertsService } from './alerts.service';
import { MarketService } from '../market/market.service';

interface AlertCondition {
  symbol: string;
  operator: string;
  value: number;
}

interface CheckResult {
  checked: number;
  triggered: number;
}

@Processor('alerts')
export class AlertsProcessor {
  private readonly logger = new Logger(AlertsProcessor.name);

  constructor(
    private readonly alertsService: AlertsService,
    private readonly marketService: MarketService,
  ) {}

  @Process('check-alerts')
  async handleCheckAlerts(_job: Job<Record<string, never>>): Promise<CheckResult> {
    this.logger.log('Starting alert check cycle');

    const activeAlerts = await this.alertsService.getActiveAlerts();

    if (activeAlerts.length === 0) {
      return { checked: 0, triggered: 0 };
    }

    // Get unique symbols from all alert conditions
    const symbols = new Set<string>();
    for (const alert of activeAlerts) {
      const condition = alert.condition as AlertCondition;
      if (condition.symbol) {
        symbols.add(condition.symbol.toUpperCase());
      }
    }

    // Fetch current prices
    const prices = await this.marketService.getPrices(Array.from(symbols));
    const priceMap = new Map<string, number>();
    for (const price of prices) {
      priceMap.set(price.symbol, price.price);
    }

    let triggered = 0;

    for (const alert of activeAlerts) {
      const condition = alert.condition as AlertCondition;
      const currentPrice = priceMap.get(condition.symbol?.toUpperCase());

      if (currentPrice === undefined) {
        continue;
      }

      const shouldTrigger = this.evaluateCondition(
        condition,
        currentPrice,
      );

      if (shouldTrigger) {
        await this.alertsService.triggerAlert(alert.id);
        triggered++;
        this.logger.log(
          `Alert ${alert.id} triggered: ${condition.symbol} ${condition.operator} ${condition.value} (current: ${currentPrice})`,
        );
      }
    }

    this.logger.log(
      `Alert check complete: ${activeAlerts.length} checked, ${triggered} triggered`,
    );

    return {
      checked: activeAlerts.length,
      triggered,
    };
  }

  private evaluateCondition(
    condition: AlertCondition,
    currentPrice: number,
  ): boolean {
    const { operator, value } = condition;

    switch (operator) {
      case 'above':
        return currentPrice > value;
      case 'below':
        return currentPrice < value;
      case 'crosses_above':
        return currentPrice >= value;
      case 'crosses_below':
        return currentPrice <= value;
      case 'percent_change': {
        const percentDiff = Math.abs(
          ((currentPrice - value) / value) * 100,
        );
        return percentDiff >= value;
      }
      default:
        this.logger.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }
}
