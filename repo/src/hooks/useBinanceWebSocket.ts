// hooks/useBinanceWebSocket.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { OrderBookData, SymbolInfo } from '../types/trading';
import { OrderBookMerger } from '../utils/orderBookMerger';
import { BinanceApiService } from '../services/binanceApi';

export const useBinanceWebSocket = (symbol: string) => {
  const [orderBook, setOrderBook] = useState<OrderBookData>({
    bids: [],
    asks: [],
    lastUpdateId: 0
  });
  
  const [symbolInfo, setSymbolInfo] = useState<SymbolInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const ws = useRef<WebSocket | null>(null);
  const snapshotLoaded = useRef(false);
  const buffer = useRef<any[]>([]);

  const processBuffer = useCallback(() => {
    if (!snapshotLoaded.current || buffer.current.length === 0) return;
    
    buffer.current.forEach(update => {
      setOrderBook(prev => OrderBookMerger.mergeOrderBook(prev, update));
    });
    buffer.current = [];
  }, []);

  const connectWebSocket = useCallback(() => {
    const streams = [
      `${symbol.toLowerCase()}@depth`,
      `${symbol.toLowerCase()}@ticker`
    ].join('/');
    
    ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      loadSnapshot();
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.stream.endsWith('@depth')) {
        handleDepthUpdate(data.data);
      } else if (data.stream.endsWith('@ticker')) {
        handleTickerUpdate(data.data);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      snapshotLoaded.current = false;
      setTimeout(() => connectWebSocket(), 5000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [symbol]);

  const loadSnapshot = async () => {
    try {
      const snapshot = await BinanceApiService.getDepthSnapshot(symbol);
      
      setOrderBook({
        bids: snapshot.bids.map(([price, quantity]: [string, string]) => ({
          price: parseFloat(price),
          quantity: parseFloat(quantity)
        })),
        asks: snapshot.asks.map(([price, quantity]: [string, string]) => ({
          price: parseFloat(price),
          quantity: parseFloat(quantity)
        })),
        lastUpdateId: snapshot.lastUpdateId
      });
      
      snapshotLoaded.current = true;
      processBuffer();
    } catch (error) {
      console.error('Failed to load snapshot:', error);
    }
  };

  const handleDepthUpdate = (data: any) => {
    if (!snapshotLoaded.current) {
      buffer.current.push(data);
      return;
    }
    
    setOrderBook(prev => OrderBookMerger.mergeOrderBook(prev, data));
  };

  const handleTickerUpdate = (data: any) => {
    setSymbolInfo({
      symbol: data.s,
      baseAsset: data.s.replace('USDT', ''),
      quoteAsset: 'USDT',
      price: parseFloat(data.c),
      change: parseFloat(data.P),
      volume: parseFloat(data.v)
    });
  };

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connectWebSocket]);

  return { orderBook, symbolInfo, isConnected };
};