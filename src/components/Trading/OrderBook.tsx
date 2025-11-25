// components/Trading/OrderBook.tsx
import React, { useMemo } from 'react';
import { DepthItem } from '../../types/trading';
import { formatPrice, formatQuantity } from '../../utils/formatting';
import './OrderBook.css';

interface OrderBookProps {
  bids: DepthItem[];
  asks: DepthItem[];
  symbolInfo?: any;
}

const OrderBook: React.FC<OrderBookProps> = ({ bids, asks, symbolInfo }) => {
  const { bidsWithTotal, asksWithTotal, maxTotal } = useMemo(() => {
    const calculateTotal = (items: DepthItem[]): DepthItem[] => {
      let total = 0;
      return items.map(item => {
        total += item.quantity;
        return { ...item, total };
      });
    };

    const bidsWithTotal = calculateTotal(bids.slice().reverse());
    const asksWithTotal = calculateTotal(asks);
    const maxTotal = Math.max(
      bidsWithTotal[bidsWithTotal.length - 1]?.total || 0,
      asksWithTotal[asksWithTotal.length - 1]?.total || 0
    );

    return { bidsWithTotal, asksWithTotal, maxTotal };
  }, [bids, asks]);

  const spread = useMemo(() => {
    if (asksWithTotal.length > 0 && bidsWithTotal.length > 0) {
      const bestAsk = asksWithTotal[0].price;
      const bestBid = bidsWithTotal[bidsWithTotal.length - 1].price;
      const spreadValue = bestAsk - bestBid;
      const spreadPercent = (spreadValue / bestBid) * 100;
      return { value: spreadValue, percent: spreadPercent };
    }
    return { value: 0, percent: 0 };
  }, [asksWithTotal, bidsWithTotal]);

  const renderDepthItem = (item: DepthItem, isBid: boolean, maxTotal: number) => {
    const percentage = (item.total! / maxTotal) * 100;
    
    return (
      <div key={item.price} className="depth-item">
        <div 
          className={`depth-bar ${isBid ? 'bid-bar' : 'ask-bar'}`}
          style={{ width: `${percentage}%` }}
        />
        <span className={isBid ? 'bid-price' : 'ask-price'}>
          {formatPrice(item.price)}
        </span>
        <span className="quantity">{formatQuantity(item.quantity)}</span>
        <span className="total">{formatQuantity(item.total!)}</span>
      </div>
    );
  };

  return (
    <div className="order-book">
      <div className="order-book-header">
        <h3>Order Book</h3>
        {symbolInfo && (
          <div className="symbol-info">
            <span className="price">${formatPrice(symbolInfo.price)}</span>
            <span className={`change ${symbolInfo.change >= 0 ? 'positive' : 'negative'}`}>
              {symbolInfo.change >= 0 ? '+' : ''}{symbolInfo.change.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="spread-info">
        <span>Spread: ${formatPrice(spread.value)} ({spread.percent.toFixed(2)}%)</span>
      </div>
      
      <div className="order-book-content">
        <div className="order-book-side">
          <div className="order-book-header-row">
            <span>Price (USDT)</span>
            <span>Amount</span>
            <span>Total</span>
          </div>
          <div className="asks-side">
            {asksWithTotal.map(item => renderDepthItem(item, false, maxTotal))}
          </div>
        </div>
        
        <div className="order-book-spread"></div>
        
        <div className="order-book-side">
          <div className="order-book-header-row">
            <span>Price (USDT)</span>
            <span>Amount</span>
            <span>Total</span>
          </div>
          <div className="bids-side">
            {bidsWithTotal.map(item => renderDepthItem(item, true, maxTotal))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OrderBook);