// components/Trading/SymbolList.tsx
import React from 'react';
import { SymbolListItem } from '../../types/trading';
import { useSymbolList } from '../../hooks/useSymbolList';
import './SymbolList.css';

interface SymbolListProps {
  currentSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const SymbolList: React.FC<SymbolListProps> = ({ currentSymbol, onSymbolChange }) => {
  const { symbols, loading } = useSymbolList();

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="symbol-list">
        <div className="symbol-list-header">
          <h3>Markets</h3>
        </div>
        <div className="loading">Loading markets...</div>
      </div>
    );
  }

  return (
    <div className="symbol-list">
      <div className="symbol-list-header">
        <h3>Markets</h3>
        <div className="search-box">
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>
      
      <div className="symbol-list-content">
        <div className="symbol-list-header-row">
          <span>Pair</span>
          <span>Price</span>
          <span>Change</span>
        </div>
        
        <div className="symbol-items">
          {symbols.map(symbol => (
            <div
              key={symbol.symbol}
              className={`symbol-item ${currentSymbol === symbol.symbol ? 'active' : ''}`}
              onClick={() => onSymbolChange(symbol.symbol)}
            >
              <div className="symbol-pair">
                <span className="base-asset">{symbol.baseAsset}</span>
                <span className="quote-asset">/{symbol.quoteAsset}</span>
              </div>
              <div className="symbol-price">
                ${symbol.lastPrice.toLocaleString()}
              </div>
              <div className={`symbol-change ${symbol.priceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                {formatChange(symbol.priceChangePercent)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(SymbolList);