// services/binanceApi.ts
import { SymbolListItem } from '../types/trading';

export class BinanceApiService {
  private static baseUrl = 'https://api.binance.com/api/v3';

  static async getSymbolList(): Promise<SymbolListItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr`);
      const data = await response.json();
      
      return data
        .filter((item: any) => item.symbol.endsWith('USDT'))
        .map((item: any) => ({
          symbol: item.symbol,
          baseAsset: item.symbol.replace('USDT', ''),
          quoteAsset: 'USDT',
          lastPrice: parseFloat(item.lastPrice),
          priceChange: parseFloat(item.priceChange),
          priceChangePercent: parseFloat(item.priceChangePercent),
          volume: parseFloat(item.volume)
        }))
        .slice(0, 50); // 限制数量
    } catch (error) {
      console.error('Failed to fetch symbol list:', error);
      return [];
    }
  }

  static async getDepthSnapshot(symbol: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/depth?symbol=${symbol}&limit=1000`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch depth snapshot:', error);
      throw error;
    }
  }

  static async getKlines(
    symbol: string,
    interval: string,
    limit: number = 500
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      const data = await response.json();
      return data.map((item: any) => ({
        time: Math.floor(item[0] / 1000),
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5]),
      }));
    } catch (error) {
      console.error('Failed to fetch klines:', error);
      return [];
    }
  }
}