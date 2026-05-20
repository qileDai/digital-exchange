// hooks/useSymbolList.ts
import { useState, useEffect } from 'react';
import { SymbolListItem } from '../types/trading';
import { BinanceApiService } from '../services/binanceApi';

export const useSymbolList = () => {
  const [symbols, setSymbols] = useState<SymbolListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        setLoading(true);
        const symbolList = await BinanceApiService.getSymbolList();
        setSymbols(symbolList);
      } catch (error) {
        console.error('Failed to fetch symbols:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSymbols();
    
    // 定期更新
    const interval = setInterval(fetchSymbols, 30000);
    return () => clearInterval(interval);
  }, []);

  return { symbols, loading };
};