import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';

interface PriceData {
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
}

interface AssetDetail extends PriceData {
  description: string;
  assetType: string;
  sparkline7d: number[];
  allTimeHigh: number;
  allTimeLow: number;
  circulatingSupply: number;
  totalSupply: number;
}

interface HeatmapItem {
  symbol: string;
  name: string;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
  category: string;
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  ADA: 'cardano',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  XRP: 'ripple',
  BNB: 'binancecoin',
  DOGE: 'dogecoin',
  LTC: 'litecoin',
};

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);
  private readonly CACHE_TTL = 5; // 5 seconds
  private readonly coingeckoBaseUrl = 'https://api.coingecko.com/api/v3';
  private readonly alphaVantageBaseUrl = 'https://www.alphavantage.co/query';

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {}

  async getPrices(symbols: string[]): Promise<PriceData[]> {
    const cacheKey = `market:prices:${symbols.sort().join(',')}`;
    const cached = await this.cacheService.get<PriceData[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const prices = await this.fetchPricesFromProviders(symbols);

    await this.cacheService.set(cacheKey, prices, this.CACHE_TTL);

    return prices;
  }

  async getAssetDetail(symbol: string): Promise<AssetDetail> {
    const cacheKey = `market:asset:${symbol}`;
    const cached = await this.cacheService.get<AssetDetail>(cacheKey);

    if (cached) {
      return cached;
    }

    const detail = await this.fetchAssetDetail(symbol);

    await this.cacheService.set(cacheKey, detail, 30); // 30 second cache for detail

    return detail;
  }

  async getHeatmap(category?: string): Promise<HeatmapItem[]> {
    const cacheKey = `market:heatmap:${category || 'all'}`;
    const cached = await this.cacheService.get<HeatmapItem[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const heatmap = await this.fetchHeatmapData(category);

    await this.cacheService.set(cacheKey, heatmap, 15); // 15 second cache

    return heatmap;
  }

  private async fetchPricesFromProviders(symbols: string[]): Promise<PriceData[]> {
    const cryptoSymbols = symbols.filter((s) => COINGECKO_IDS[s.toUpperCase()]);
    const otherSymbols = symbols.filter((s) => !COINGECKO_IDS[s.toUpperCase()]);

    const results: PriceData[] = [];

    if (cryptoSymbols.length > 0) {
      const cryptoPrices = await this.fetchFromCoinGecko(cryptoSymbols);
      results.push(...cryptoPrices);
    }

    if (otherSymbols.length > 0) {
      const otherPrices = await this.fetchFromAlphaVantage(otherSymbols);
      results.push(...otherPrices);
    }

    return results;
  }

  private async fetchFromCoinGecko(symbols: string[]): Promise<PriceData[]> {
    try {
      const ids = symbols
        .map((s) => COINGECKO_IDS[s.toUpperCase()])
        .filter(Boolean)
        .join(',');

      const apiKey = this.configService.get<string>('COINGECKO_API_KEY');
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey;
      }

      const response = await fetch(
        `${this.coingeckoBaseUrl}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
        { headers },
      );

      if (!response.ok) {
        this.logger.warn(`CoinGecko API returned ${response.status}`);
        return this.getFallbackCryptoPrices(symbols);
      }

      const data = (await response.json()) as Array<{
        symbol: string;
        name: string;
        current_price: number;
        price_change_24h: number;
        price_change_percentage_24h: number;
        high_24h: number;
        low_24h: number;
        total_volume: number;
        market_cap: number;
        last_updated: string;
      }>;

      return data.map((coin) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change24h: coin.price_change_24h,
        changePercent24h: coin.price_change_percentage_24h,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        volume24h: coin.total_volume,
        marketCap: coin.market_cap,
        lastUpdated: coin.last_updated,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to fetch from CoinGecko: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return this.getFallbackCryptoPrices(symbols);
    }
  }

  private async fetchFromAlphaVantage(symbols: string[]): Promise<PriceData[]> {
    const apiKey = this.configService.get<string>('ALPHA_VANTAGE_API_KEY');

    if (!apiKey) {
      this.logger.warn('Alpha Vantage API key not configured');
      return this.getFallbackTraditionalPrices(symbols);
    }

    const results: PriceData[] = [];

    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `${this.alphaVantageBaseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
        );

        if (!response.ok) {
          this.logger.warn(`Alpha Vantage returned ${response.status} for ${symbol}`);
          continue;
        }

        const data = (await response.json()) as {
          'Global Quote': {
            '01. symbol': string;
            '05. price': string;
            '08. previous close': string;
            '09. change': string;
            '10. change percent': string;
            '03. high': string;
            '04. low': string;
            '06. volume': string;
            '07. latest trading day': string;
          };
        };

        const quote = data['Global Quote'];

        if (quote) {
          results.push({
            symbol: quote['01. symbol'],
            name: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            change24h: parseFloat(quote['09. change']),
            changePercent24h: parseFloat(
              quote['10. change percent'].replace('%', ''),
            ),
            high24h: parseFloat(quote['03. high']),
            low24h: parseFloat(quote['04. low']),
            volume24h: parseFloat(quote['06. volume']),
            marketCap: 0,
            lastUpdated: quote['07. latest trading day'],
          });
        }
      } catch (error) {
        this.logger.error(
          `Failed to fetch ${symbol} from Alpha Vantage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return results;
  }

  private async fetchAssetDetail(symbol: string): Promise<AssetDetail> {
    const upperSymbol = symbol.toUpperCase();
    const coingeckoId = COINGECKO_IDS[upperSymbol];

    if (coingeckoId) {
      return this.fetchCoinGeckoDetail(coingeckoId, upperSymbol);
    }

    return this.getDefaultAssetDetail(upperSymbol);
  }

  private async fetchCoinGeckoDetail(
    id: string,
    symbol: string,
  ): Promise<AssetDetail> {
    try {
      const apiKey = this.configService.get<string>('COINGECKO_API_KEY');
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey;
      }

      const response = await fetch(
        `${this.coingeckoBaseUrl}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`,
        { headers },
      );

      if (!response.ok) {
        return this.getDefaultAssetDetail(symbol);
      }

      const data = (await response.json()) as {
        name: string;
        description: { en: string };
        market_data: {
          current_price: { usd: number };
          price_change_24h: number;
          price_change_percentage_24h: number;
          high_24h: { usd: number };
          low_24h: { usd: number };
          total_volume: { usd: number };
          market_cap: { usd: number };
          ath: { usd: number };
          atl: { usd: number };
          circulating_supply: number;
          total_supply: number;
          sparkline_7d: { price: number[] };
        };
      };

      return {
        symbol,
        name: data.name,
        price: data.market_data.current_price.usd,
        change24h: data.market_data.price_change_24h,
        changePercent24h: data.market_data.price_change_percentage_24h,
        high24h: data.market_data.high_24h.usd,
        low24h: data.market_data.low_24h.usd,
        volume24h: data.market_data.total_volume.usd,
        marketCap: data.market_data.market_cap.usd,
        lastUpdated: new Date().toISOString(),
        description: data.description.en.substring(0, 500),
        assetType: 'crypto',
        sparkline7d: data.market_data.sparkline_7d?.price || [],
        allTimeHigh: data.market_data.ath.usd,
        allTimeLow: data.market_data.atl.usd,
        circulatingSupply: data.market_data.circulating_supply,
        totalSupply: data.market_data.total_supply,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch detail for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return this.getDefaultAssetDetail(symbol);
    }
  }

  private async fetchHeatmapData(category?: string): Promise<HeatmapItem[]> {
    try {
      const apiKey = this.configService.get<string>('COINGECKO_API_KEY');
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey;
      }

      const response = await fetch(
        `${this.coingeckoBaseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`,
        { headers },
      );

      if (!response.ok) {
        return this.getFallbackHeatmap();
      }

      const data = (await response.json()) as Array<{
        symbol: string;
        name: string;
        price_change_percentage_24h: number;
        market_cap: number;
        total_volume: number;
      }>;

      let items: HeatmapItem[] = data.map((coin) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        changePercent24h: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        category: 'crypto',
      }));

      if (category) {
        items = items.filter((item) => item.category === category);
      }

      return items;
    } catch (error) {
      this.logger.error(
        `Failed to fetch heatmap: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return this.getFallbackHeatmap();
    }
  }

  private getFallbackCryptoPrices(symbols: string[]): PriceData[] {
    return symbols
      .filter((s) => COINGECKO_IDS[s.toUpperCase()])
      .map((symbol) => ({
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        price: 0,
        change24h: 0,
        changePercent24h: 0,
        high24h: 0,
        low24h: 0,
        volume24h: 0,
        marketCap: 0,
        lastUpdated: new Date().toISOString(),
      }));
  }

  private getFallbackTraditionalPrices(symbols: string[]): PriceData[] {
    return symbols.map((symbol) => ({
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      price: 0,
      change24h: 0,
      changePercent24h: 0,
      high24h: 0,
      low24h: 0,
      volume24h: 0,
      marketCap: 0,
      lastUpdated: new Date().toISOString(),
    }));
  }

  private getDefaultAssetDetail(symbol: string): AssetDetail {
    return {
      symbol,
      name: symbol,
      price: 0,
      change24h: 0,
      changePercent24h: 0,
      high24h: 0,
      low24h: 0,
      volume24h: 0,
      marketCap: 0,
      lastUpdated: new Date().toISOString(),
      description: 'Asset data temporarily unavailable',
      assetType: 'unknown',
      sparkline7d: [],
      allTimeHigh: 0,
      allTimeLow: 0,
      circulatingSupply: 0,
      totalSupply: 0,
    };
  }

  private getFallbackHeatmap(): HeatmapItem[] {
    return Object.entries(COINGECKO_IDS).map(([symbol, name]) => ({
      symbol,
      name,
      changePercent24h: 0,
      marketCap: 0,
      volume24h: 0,
      category: 'crypto',
    }));
  }
}
