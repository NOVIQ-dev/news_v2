import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

interface SubscriptionPayload {
  channel: string;
  params?: Record<string, string>;
}

interface ClientInfo {
  id: string;
  userId?: string;
  rooms: Set<string>;
  connectedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class EventsGateway
  implements
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnModuleInit,
  OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private readonly clients = new Map<string, ClientInfo>();
  private subscriber: Redis | null = null;

  constructor(private readonly configService: ConfigService) { }

  async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );

    this.subscriber = new Redis(redisUrl);

    // Subscribe to alert channels
    this.subscriber.on('message', (channel: string, message: string) => {
      this.handleRedisMessage(channel, message);
    });

    // Pattern subscribe for alerts and news
    await this.subscriber.psubscribe('alerts:*', 'news:*');

    this.subscriber.on('pmessage', (_pattern: string, channel: string, message: string) => {
      this.handleRedisMessage(channel, message);
    });

    this.logger.log('Events Gateway Redis subscriber initialized');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.subscriber) {
      await this.subscriber.quit();
    }
  }

  afterInit(): void {
    this.logger.log('Events WebSocket Gateway initialized');
  }

  handleConnection(client: Socket): void {
    const clientInfo: ClientInfo = {
      id: client.id,
      rooms: new Set<string>(),
      connectedAt: new Date(),
    };

    this.clients.set(client.id, clientInfo);

    this.logger.log(
      `Client connected: ${client.id} (Total: ${this.clients.size})`,
    );

    client.emit('connected', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket): void {
    this.clients.delete(client.id);

    this.logger.log(
      `Client disconnected: ${client.id} (Total: ${this.clients.size})`,
    );
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string },
  ): { event: string; data: { authenticated: boolean } } {
    const clientInfo = this.clients.get(client.id);

    if (clientInfo) {
      clientInfo.userId = payload.userId;

      // Auto-join user-specific rooms
      const alertsRoom = `alerts:${payload.userId}`;
      void client.join(alertsRoom);
      clientInfo.rooms.add(alertsRoom);

      this.logger.log(
        `Client ${client.id} authenticated as user ${payload.userId}`,
      );
    }

    return {
      event: 'authenticated',
      data: { authenticated: true },
    };
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscriptionPayload,
  ): { event: string; data: { channel: string; subscribed: boolean } } {
    const { channel, params } = payload;

    let room: string;

    switch (channel) {
      case 'market':
        room = `market:${params?.symbol || 'all'}`;
        break;
      case 'news':
        room = `news:${params?.region || 'all'}`;
        break;
      case 'alerts':
        room = `alerts:${params?.userId || 'all'}`;
        break;
      default:
        room = channel;
    }

    void client.join(room);

    const clientInfo = this.clients.get(client.id);
    if (clientInfo) {
      clientInfo.rooms.add(room);
    }

    this.logger.log(`Client ${client.id} subscribed to: ${room}`);

    return {
      event: 'subscribed',
      data: { channel: room, subscribed: true },
    };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscriptionPayload,
  ): { event: string; data: { channel: string; unsubscribed: boolean } } {
    const { channel } = payload;

    void client.leave(channel);

    const clientInfo = this.clients.get(client.id);
    if (clientInfo) {
      clientInfo.rooms.delete(channel);
    }

    this.logger.log(`Client ${client.id} unsubscribed from: ${channel}`);

    return {
      event: 'unsubscribed',
      data: { channel, unsubscribed: true },
    };
  }

  @SubscribeMessage('ping')
  handlePing(): { event: string; data: { timestamp: string } } {
    return {
      event: 'pong',
      data: { timestamp: new Date().toISOString() },
    };
  }

  emitToRoom(room: string, event: string, data: Record<string, unknown>): void {
    this.server.to(room).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: Record<string, unknown>): void {
    this.server.to(`alerts:${userId}`).emit(event, data);
  }

  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  private handleRedisMessage(channel: string, message: string): void {
    try {
      const data = JSON.parse(message) as Record<string, unknown>;

      if (channel.startsWith('alerts:')) {
        this.server.to(channel).emit('alertTriggered', data);
      } else if (channel.startsWith('news:')) {
        this.server.to(channel).emit('newsUpdate', data);
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle Redis message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
