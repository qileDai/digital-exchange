// components/Trading/TradingChart.tsx
import React, { useEffect, useRef } from 'react';
import './TradingChart.css';

interface TradingChartProps {
  symbol: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 清理现有图表
    while (chartContainerRef.current.firstChild) {
      chartContainerRef.current.removeChild(chartContainerRef.current.firstChild);
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${symbol}`,
      interval: '5',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: false,
      container_id: 'tradingview_chart',
      studies: ['RSI@tv-basicstudies'],
      support_host: 'https://www.tradingview.com'
    });

    chartContainerRef.current.appendChild(script);

    return () => {
      if (chartContainerRef.current && script.parentNode) {
        chartContainerRef.current.removeChild(script);
      }
    };
  }, [symbol]);

  return (
    <div className="trading-chart">
      <div className="chart-header">
        <div className="chart-tabs">
          <button className="tab active">Price</button>
          <button className="tab">Depth</button>
          <button className="tab">TradingView</button>
        </div>
        <div className="chart-intervals">
          <button className="interval">1m</button>
          <button className="interval">5m</button>
          <button className="interval active">15m</button>
          <button className="interval">1h</button>
          <button className="interval">4h</button>
          <button className="interval">1d</button>
        </div>
      </div>
      
      <div 
        ref={chartContainerRef} 
        className="tradingview-widget-container"
        style={{ height: 'calc(100% - 40px)', width: '100%' }}
      >
        <div 
          id="tradingview_chart"
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
};

export default TradingChart;