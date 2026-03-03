export interface AppConfig {
  nodeEnv: string;
  port: number;
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  anthropic: {
    apiKey: string;
  };
  externalApis: {
    coingeckoApiKey: string;
    alphaVantageApiKey: string;
    polymarketApiKey: string;
  };
  cors: {
    origin: string;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.API_PORT || '3001', 10),
  database: {
    url: process.env.DATABASE_URL || '',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  externalApis: {
    coingeckoApiKey: process.env.COINGECKO_API_KEY || '',
    alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
    polymarketApiKey: process.env.POLYMARKET_API_KEY || '',
  },
  cors: {
    origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
});
