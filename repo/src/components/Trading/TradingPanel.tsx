// components/Trading/TradingPanel.tsx
import React, { useState, useMemo } from 'react';
import './TradingPanel.css';

interface TradingPanelProps {
  symbol: string;
  currentPrice?: number;
}

const TradingPanel: React.FC<TradingPanelProps> = ({ symbol, currentPrice }) => {
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState<string>(currentPrice?.toString() || '');
  const [quantity, setQuantity] = useState<string>('');
  const [total, setTotal] = useState<string>('');

  const calculatedTotal = useMemo(() => {
    if (price && quantity) {
      return (parseFloat(price) * parseFloat(quantity)).toString();
    }
    return '';
  }, [price, quantity]);

  const handlePriceChange = (value: string) => {
    setPrice(value);
    if (quantity && value) {
      setTotal((parseFloat(value) * parseFloat(quantity)).toString());
    }
  };

  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    if (price && value) {
      setTotal((parseFloat(price) * parseFloat(value)).toString());
    }
  };

  const handleTotalChange = (value: string) => {
    setTotal(value);
    if (price && value) {
      setQuantity((parseFloat(value) / parseFloat(price)).toString());
    }
  };

  const handlePercentageClick = (percentage: number) => {
    if (currentPrice) {
      const newPrice = currentPrice * (1 + (side === 'buy' ? -percentage/100 : percentage/100));
      setPrice(newPrice.toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 处理订单提交
    console.log('Order submitted:', { orderType, side, price, quantity, total });
  };

  return (
    <div className="trading-panel">
      <div className="panel-tabs">
        <button className={`tab ${side === 'buy' ? 'active buy' : ''}`} onClick={() => setSide('buy')}>
          Buy
        </button>
        <button className={`tab ${side === 'sell' ? 'active sell' : ''}`} onClick={() => setSide('sell')}>
          Sell
        </button>
      </div>

      <div className="order-type-selector">
        <button 
          className={`type-btn ${orderType === 'limit' ? 'active' : ''}`}
          onClick={() => setOrderType('limit')}
        >
          Limit
        </button>
        <button 
          className={`type-btn ${orderType === 'market' ? 'active' : ''}`}
          onClick={() => setOrderType('market')}
        >
          Market
        </button>
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        {orderType === 'limit' && (
          <div className="form-group">
            <label>Price (USDT)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
            <div className="quick-price-buttons">
              {[0.5, 1, 2].map(percent => (
                <button
                  key={percent}
                  type="button"
                  className="quick-btn"
                  onClick={() => handlePercentageClick(percent)}
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Amount ({symbol.replace('USDT', '')})</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder="0.00"
            step="0.0001"
          />
        </div>

        <div className="form-group">
          <label>Total (USDT)</label>
          <input
            type="number"
            value={orderType === 'market' ? total : calculatedTotal}
            onChange={(e) => handleTotalChange(e.target.value)}
            placeholder="0.00"
            step="0.01"
            readOnly={orderType === 'limit'}
          />
        </div>

        <button 
          type="submit" 
          className={`submit-btn ${side}`}
        >
          {side === 'buy' ? 'Buy' : 'Sell'} {symbol.replace('USDT', '')}
        </button>
      </form>

      <div className="balance-info">
        <div className="balance-item">
          <span>Available:</span>
          <span>0.00 USDT</span>
        </div>
        <div className="balance-item">
          <span>In Orders:</span>
          <span>0.00 USDT</span>
        </div>
      </div>
    </div>
  );
};

export default TradingPanel;