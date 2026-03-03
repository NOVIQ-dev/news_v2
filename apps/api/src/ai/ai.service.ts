import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../market/market.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { AnalyzeDto } from './dto/analyze.dto';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatItem {
  id: string;
  userId: string;
  title: string | null;
  messages: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface StreamChunk {
  type: 'text' | 'done' | 'error';
  content: string;
  chatId?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly anthropic: Anthropic;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly marketService: MarketService,
    private readonly portfolioService: PortfolioService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async *analyzeStream(
    userId: string,
    dto: AnalyzeDto,
  ): AsyncGenerator<StreamChunk> {
    let existingMessages: ChatMessage[] = [];
    let chatId = dto.chatId;

    // Load existing chat if continuing
    if (chatId) {
      const chat = await this.prisma.aiChat.findUnique({
        where: { id: chatId },
      });

      if (chat) {
        if (chat.userId !== userId) {
          yield { type: 'error', content: 'Access denied' };
          return;
        }
        existingMessages = chat.messages as ChatMessage[];
      }
    }

    // Build market context
    const marketContext = await this.buildMarketContext(userId, dto.symbols);

    const systemPrompt = this.buildSystemPrompt(marketContext);

    // Build messages array
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...existingMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: dto.message },
    ];

    try {
      const stream = this.anthropic.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        messages,
      });

      let fullResponse = '';

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          fullResponse += event.delta.text;
          yield {
            type: 'text',
            content: event.delta.text,
          };
        }
      }

      // Save to chat history
      const updatedMessages: ChatMessage[] = [
        ...existingMessages,
        { role: 'user', content: dto.message },
        { role: 'assistant', content: fullResponse },
      ];

      // Generate title from first message if new chat
      const title =
        existingMessages.length === 0
          ? dto.message.substring(0, 100)
          : undefined;

      if (chatId) {
        await this.prisma.aiChat.update({
          where: { id: chatId },
          data: {
            messages: updatedMessages as unknown as Record<string, unknown>[],
            ...(title && { title }),
          },
        });
      } else {
        const newChat = await this.prisma.aiChat.create({
          data: {
            userId,
            title: title || 'New Analysis',
            messages: updatedMessages as unknown as Record<string, unknown>[],
          },
        });
        chatId = newChat.id;
      }

      yield {
        type: 'done',
        content: '',
        chatId,
      };
    } catch (error) {
      this.logger.error(
        `AI analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      yield {
        type: 'error',
        content: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  async getChats(userId: string): Promise<AiChatItem[]> {
    return this.prisma.aiChat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        userId: true,
        title: true,
        messages: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getChatById(userId: string, chatId: string): Promise<AiChatItem> {
    const chat = await this.prisma.aiChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return chat;
  }

  async deleteChat(userId: string, chatId: string): Promise<void> {
    const chat = await this.prisma.aiChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.aiChat.delete({
      where: { id: chatId },
    });

    this.logger.log(`Chat deleted: ${chatId}`);
  }

  private async buildMarketContext(
    userId: string,
    symbols?: string[],
  ): Promise<string> {
    const contextParts: string[] = [];

    try {
      // Add portfolio context
      const portfolio = await this.portfolioService.getSummary(userId);

      if (portfolio.holdings.length > 0) {
        contextParts.push('## User Portfolio');
        contextParts.push(
          `Total Value: $${portfolio.totalValue.toFixed(2)} | P&L: $${portfolio.totalPnL.toFixed(2)} (${portfolio.totalPnLPercent.toFixed(2)}%)`,
        );

        for (const holding of portfolio.holdings) {
          contextParts.push(
            `- ${holding.symbol}: ${holding.amount} units @ $${holding.currentPrice.toFixed(2)} (P&L: ${holding.pnlPercent.toFixed(2)}%)`,
          );
        }
      }
    } catch {
      // Portfolio data unavailable, continue without it
    }

    try {
      // Add market data for requested symbols
      const symbolList =
        symbols && symbols.length > 0
          ? symbols
          : ['BTC', 'ETH', 'SOL'];

      const prices = await this.marketService.getPrices(symbolList);

      if (prices.length > 0) {
        contextParts.push('\n## Current Market Data');

        for (const price of prices) {
          contextParts.push(
            `- ${price.symbol} (${price.name}): $${price.price.toFixed(2)} | 24h: ${price.changePercent24h.toFixed(2)}% | Vol: $${price.volume24h.toLocaleString()}`,
          );
        }
      }
    } catch {
      // Market data unavailable, continue without it
    }

    return contextParts.join('\n');
  }

  private buildSystemPrompt(marketContext: string): string {
    return `You are Fintelligence AI, an expert financial analyst assistant integrated into a financial intelligence dashboard. You provide data-driven analysis, market insights, and actionable recommendations.

## Your Capabilities
- Analyze market trends, price action, and technical indicators
- Evaluate portfolio allocation and risk management
- Provide macro-economic analysis and its impact on assets
- Explain complex financial concepts clearly
- Suggest entry/exit points with reasoning
- Analyze news impact on markets

## Guidelines
- Always provide balanced analysis with both bullish and bearish scenarios
- Include specific data points and numbers in your analysis
- Clearly separate facts from opinions
- Include risk warnings where appropriate
- Format responses with markdown for readability
- Never provide definitive financial advice; present as analysis and suggestions
- When discussing price targets, always provide ranges and confidence levels

## Current Market Context
${marketContext || 'Market data currently unavailable. Provide analysis based on general knowledge and user query.'}

## Response Format
Structure your responses with:
1. **Summary** - Key takeaway in 1-2 sentences
2. **Analysis** - Detailed breakdown with data
3. **Outlook** - Short-term and medium-term perspective
4. **Action Items** - Suggested next steps (if applicable)
5. **Risk Factors** - What could go wrong`;
  }
}
