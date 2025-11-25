// components/Layout/Header.tsx
import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="exchange-header">
      <div className="header-left">
        <div className="logo">
          <h1>CryptoExchange</h1>
        </div>
        <nav className="main-nav">
          <a href="#markets" className="nav-item active">Markets</a>
          <a href="#trade" className="nav-item">Trade</a>
          <a href="#futures" className="nav-item">Futures</a>
          <a href="#earn" className="nav-item">Earn</a>
        </nav>
      </div>
      
      <div className="header-center">
        <div className="market-stats">
          <div className="stat-item">
            <span className="stat-label">BTC Price</span>
            <span className="stat-value">$36,542.12</span>
            <span className="stat-change positive">+2.34%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">24h Volume</span>
            <span className="stat-value">$28.45B</span>
          </div>
        </div>
      </div>
      
      <div className="header-right">
        <div className="user-actions">
          <button className="btn btn-secondary">Connect Wallet</button>
          <button className="btn btn-primary">Sign In</button>
        </div>
      </div>
    </header>
  );
};

export default Header;