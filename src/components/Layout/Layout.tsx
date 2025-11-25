// components/Layout/Layout.tsx
import React, { useState } from 'react';
import Header from './Header';
import SymbolList from '../Trading/SymbolList';
import TradingChart from '../Trading/TradingChart';
import TradingPanel from '../Trading/TradingPanel';
import OrderBook from '../Trading/OrderBook';
import { useBinanceWebSocket } from '../../hooks/useBinanceWebSocket';
import './Layout.css';

const Layout: React.FC = () => {
  const [currentSymbol, setCurrentSymbol] = useState('BTCUSDT');
  const { orderBook, symbolInfo, isConnected } = useBinanceWebSocket(currentSymbol);

  return (
    <div className="exchange-layout">
      <Header />
      
      <div className="connection-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </div>
      
      <div className="main-content">
        {/* 左边 - 交易对列表 */}
        <div className="left-sidebar">
          <SymbolList 
            currentSymbol={currentSymbol}
            onSymbolChange={setCurrentSymbol}
          />
        </div>

        {/* 中间 - 交易图表和面板 */}
        <div className="center-content">
          <div className="chart-container">
            <TradingChart symbol={currentSymbol} />
          </div>
          <div className="trading-panel-container">
            <TradingPanel 
              symbol={currentSymbol}
              currentPrice={symbolInfo?.price}
            />
          </div>
        </div>

        {/* 右边 - 订单簿 */}
        <div className="right-sidebar">
          <OrderBook 
            bids={orderBook.bids}
            asks={orderBook.asks}
            symbolInfo={symbolInfo}
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;