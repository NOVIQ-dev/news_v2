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
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MarketService } from './market.service';

interface SubscribePayload {
  symbols: string[];
}

interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  timestamp: string;
}

@WebSocketGateway({
  namespace: '/market',
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class MarketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MarketGateway.name);
  private priceInterval: NodeJS.Timeout | null = null;
  private subscribedSymbols = new Set<string>();

  constructor(private readonly marketService: MarketService) {}

  afterInit(): void {
    this.logger.log('Market WebSocket Gateway initialized');
    this.startPricePolling();
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscribePayload,
  ): { event: string; data: { subscribed: string[] } } {
    const { symbols } = payload;

    for (const symbol of symbols) {
      const room = `market:${symbol.toUpperCase()}`;
      void client.join(room);
      this.subscribedSymbols.add(symbol.toUpperCase());
    }

    this.logger.log(
      `Client ${client.id} subscribed to: ${symbols.join(', ')}`,
    );

    return {
      event: 'subscribed',
      data: { subscribed: symbols },
    };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscribePayload,
  ): { event: string; data: { unsubscribed: string[] } } {
    const { symbols } = payload;

    for (const symbol of symbols) {
      const room = `market:${symbol.toUpperCase()}`;
      void client.leave(room);
    }

    this.logger.log(
      `Client ${client.id} unsubscribed from: ${symbols.join(', ')}`,
    );

    return {
      event: 'unsubscribed',
      data: { unsubscribed: symbols },
    };
  }

  async emitPriceUpdate(update: PriceUpdate): Promise<void> {
    const room = `market:${update.symbol}`;
    this.server.to(room).emit('priceUpdate', update);
  }

  private startPricePolling(): void {
    this.priceInterval = setInterval(async () => {
      if (this.subscribedSymbols.size === 0) return;

      try {
        const symbols = Array.from(this.subscribedSymbols);
        const prices = await this.marketService.getPrices(symbols);

        for (const price of prices) {
          const update: PriceUpdate = {
            symbol: price.symbol,
            price: price.price,
            change24h: price.change24h,
            changePercent24h: price.changePercent24h,
            timestamp: new Date().toISOString(),
          };

          await this.emitPriceUpdate(update);
        }
      } catch (error) {
        this.logger.error(
          `Price polling error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }, 5000); // Poll every 5 seconds
  }

  onModuleDestroy(): void {
    if (this.priceInterval) {
      clearInterval(this.priceInterval);
    }
  }
}
