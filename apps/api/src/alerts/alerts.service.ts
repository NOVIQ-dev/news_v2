import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

interface AlertItem {
  id: string;
  userId: string;
  type: string;
  condition: unknown;
  message: string | null;
  isActive: boolean;
  lastTriggered: Date | null;
  createdAt: Date;
}

interface AlertNotification {
  alertId: string;
  userId: string;
  type: string;
  message: string;
  condition: unknown;
  triggeredAt: string;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(userId: string): Promise<AlertItem[]> {
    return this.prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateAlertDto): Promise<AlertItem> {
    const alert = await this.prisma.alert.create({
      data: {
        userId,
        type: dto.type,
        condition: dto.condition as any,
        message: dto.message,
      },
    });

    this.logger.log(`Alert created: ${alert.id} for user ${userId}`);

    return alert;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateAlertDto,
  ): Promise<AlertItem> {
    const existing = await this.prisma.alert.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Alert not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.alert.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.condition !== undefined && { condition: dto.condition }),
        ...(dto.message !== undefined && { message: dto.message }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    this.logger.log(`Alert updated: ${id}`);

    return updated;
  }

  async delete(userId: string, id: string): Promise<void> {
    const existing = await this.prisma.alert.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Alert not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.alert.delete({
      where: { id },
    });

    this.logger.log(`Alert deleted: ${id}`);
  }

  async getActiveAlerts(): Promise<AlertItem[]> {
    return this.prisma.alert.findMany({
      where: { isActive: true },
    });
  }

  async triggerAlert(alertId: string): Promise<void> {
    const alert = await this.prisma.alert.update({
      where: { id: alertId },
      data: { lastTriggered: new Date() },
    });

    const notification: AlertNotification = {
      alertId: alert.id,
      userId: alert.userId,
      type: alert.type,
      message: alert.message || `Alert triggered for ${alert.type}`,
      condition: alert.condition,
      triggeredAt: new Date().toISOString(),
    };

    // Publish to Redis for WebSocket delivery
    await this.cacheService.publish(
      `alerts:${alert.userId}`,
      JSON.stringify(notification),
    );

    this.logger.log(`Alert triggered: ${alertId} for user ${alert.userId}`);
  }
}
