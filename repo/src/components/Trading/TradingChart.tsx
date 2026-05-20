// components/Trading/TradingChart.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries, Time } from 'lightweight-charts';
import { BinanceApiService } from '../../services/binanceApi';
import './TradingChart.css';

interface TradingChartProps {
  symbol: string;
}

const INTERVALS = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
];

const TradingChart: React.FC<TradingChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastCandleTimeRef = useRef<number>(0);

  const [interval, setInterval] = useState('15m');
  const [isConnected, setIsConnected] = useState(false);

  const fetchAndSetData = useCallback(async (sym: string, intv: string) => {
    if (!seriesRef.current) return;

    const klines = await BinanceApiService.getKlines(sym, intv, 500);
    if (klines.length > 0) {
      seriesRef.current.setData(klines as CandlestickData[]);
      lastCandleTimeRef.current = klines[klines.length - 1].time as number;
    }
  }, []);

  const connectKlineWebSocket = useCallback(
    (sym: string, intv: string) => {
      // 关闭旧的 WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const streamUrl = `wss://stream.binance.com:9443/ws/${sym.toLowerCase()}@kline_${intv}`;
      const ws = new WebSocket(streamUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`[Binance WS] Kline connected: ${sym}@kline_${intv}`);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (!msg.k || !seriesRef.current) return;

          const kline = msg.k;
          const time = Math.floor(kline.t / 1000) as Time;
          const candle: CandlestickData = {
            time,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
          };

          if (time === lastCandleTimeRef.current) {
            // 更新当前未闭合的 K线
            seriesRef.current.update(candle);
          } else {
            // 新 K线
            seriesRef.current.update(candle);
            lastCandleTimeRef.current = time as number;
          }
        } catch (err) {
          console.error('[Binance WS] Parse error:', err);
        }
      };

      ws.onclose = (e) => {
        console.log(`[Binance WS] Kline disconnected: code=${e.code}, reason=${e.reason}`);
        setIsConnected(false);
        // 自动重连
        setTimeout(() => {
          connectKlineWebSocket(sym, intv);
        }, 3000);
      };

      ws.onerror = (err) => {
        console.error('[Binance WS] Kline error:', err);
        setIsConnected(false);
      };
    },
    []
  );

  // 初始化图表
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: '#1a1a2e' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2a3e' },
        horzLines: { color: '#2a2a3e' },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        borderColor: '#2a2a3e',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2a2a3e',
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // 响应式处理
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  // symbol 或 interval 变化时重新加载数据
  useEffect(() => {
    if (!seriesRef.current) return;

    fetchAndSetData(symbol, interval);
    connectKlineWebSocket(symbol, interval);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbol, interval, fetchAndSetData, connectKlineWebSocket]);

  return (
    <div className="trading-chart">
      <div className="chart-header">
        <div className="chart-tabs">
          <button className="tab active">Price</button>
          <button className="tab">Depth</button>
        </div>
        <div className="chart-intervals">
          {INTERVALS.map((item) => (
            <button
              key={item.value}
              className={`interval ${interval === item.value ? 'active' : ''}`}
              onClick={() => setInterval(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="chart-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <span className="status-text">
            {isConnected ? 'Binance Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div
        ref={chartContainerRef}
        className="chart-container"
      />
    </div>
  );
};

export default TradingChart;