// hooks/useBinanceWebSocket.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { OrderBookData, SymbolInfo } from '../types/trading';
import { OrderBookMerger } from '../utils/orderBookMerger';
import { BinanceApiService } from '../services/binanceApi';

type BinanceDepthStreamData = {
  b?: [string, string][];
  a?: [string, string][];
  u?: number;
  bids?: [string, string][];
  asks?: [string, string][];
  lastUpdateId?: number;
};

export const useBinanceWebSocket = (symbol: string) => {
  const [orderBook, setOrderBook] = useState<OrderBookData>({
    bids: [],
    asks: [],
    lastUpdateId: 0,
  });

  const [symbolInfo, setSymbolInfo] = useState<SymbolInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const snapshotLoaded = useRef(false);
  const buffer = useRef<BinanceDepthStreamData[]>([]);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);

  const normalizeDepthUpdate = useCallback((data: BinanceDepthStreamData) => {
    return {
      bids: data.bids ?? data.b ?? [],
      asks: data.asks ?? data.a ?? [],
      lastUpdateId: data.lastUpdateId ?? data.u ?? 0,
    };
  }, []);

  const processBuffer = useCallback(() => {
    if (!snapshotLoaded.current || buffer.current.length === 0) {
      return;
    }

    buffer.current.forEach((update) => {
      const normalizedUpdate = normalizeDepthUpdate(update);
      setOrderBook((prev) => OrderBookMerger.mergeOrderBook(prev, normalizedUpdate));
    });
    buffer.current = [];
  }, [normalizeDepthUpdate]);

  const loadSnapshot = useCallback(async () => {
    try {
      const snapshot = await BinanceApiService.getDepthSnapshot(symbol);

      setOrderBook({
        bids: snapshot.bids.map(([price, quantity]: [string, string]) => ({
          price: parseFloat(price),
          quantity: parseFloat(quantity),
        })),
        asks: snapshot.asks.map(([price, quantity]: [string, string]) => ({
          price: parseFloat(price),
          quantity: parseFloat(quantity),
        })),
        lastUpdateId: snapshot.lastUpdateId,
      });

      snapshotLoaded.current = true;
      processBuffer();
    } catch (error) {
      console.error('Failed to load snapshot:', error);
    }
  }, [processBuffer, symbol]);

  const connectWebSocket = useCallback(() => {
    const streams = [`${symbol.toLowerCase()}@depth`, `${symbol.toLowerCase()}@ticker`].join('/');

    if (ws.current) {
      ws.current.close();
    }

    ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.current.onopen = () => {
      setIsConnected(true);
      loadSnapshot();
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.stream?.endsWith('@depth')) {
        handleDepthUpdate(data.data);
      } else if (data.stream?.endsWith('@ticker')) {
        handleTickerUpdate(data.data);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      snapshotLoaded.current = false;

      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }

      if (shouldReconnectRef.current) {
        reconnectTimeoutRef.current = window.setTimeout(() => connectWebSocket(), 5000);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [loadSnapshot, symbol]);

  const handleDepthUpdate = (data: BinanceDepthStreamData) => {
    const normalizedUpdate = normalizeDepthUpdate(data);

    if (!snapshotLoaded.current) {
      buffer.current.push(normalizedUpdate);
      return;
    }

    setOrderBook((prev) => OrderBookMerger.mergeOrderBook(prev, normalizedUpdate));
  };

  const handleTickerUpdate = (data: any) => {
    setSymbolInfo({
      symbol: data.s,
      baseAsset: data.s.replace('USDT', ''),
      quoteAsset: 'USDT',
      price: parseFloat(data.c),
      change: parseFloat(data.P),
      volume: parseFloat(data.v),
    });
  };

  useEffect(() => {
    shouldReconnectRef.current = true;
    snapshotLoaded.current = false;
    buffer.current = [];
    connectWebSocket();

    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }

      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connectWebSocket]);

  return { orderBook, symbolInfo, isConnected };
};
