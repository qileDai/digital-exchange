// types/trading.ts
export interface DepthItem {
    price: number;
    quantity: number;
    total?: number;
  }
  
  export interface OrderBookData {
    bids: DepthItem[];
    asks: DepthItem[];
    lastUpdateId: number;
  }
  
  export interface SymbolInfo {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    price: number;
    change: number;
    volume: number;
  }
  
  export interface TradePanelData {
    symbol: string;
    price: number;
    quantity: number;
    total: number;
  }
  
  export interface TradeOrder {
    id: string;
    type: 'buy' | 'sell';
    price: number;
    quantity: number;
    total: number;
    timestamp: number;
  }
  
  export interface SymbolListItem {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    lastPrice: number;
    priceChange: number;
    priceChangePercent: number;
    volume: number;
  }