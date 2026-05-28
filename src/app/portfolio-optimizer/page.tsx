'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Zap } from 'lucide-react';
import InfoTip from '../../components/Tooltip';
import { calculateEfficientFrontier, getAssetStats, type AssetInput, type PortfolioResult } from '../../lib/portfolioOptimizer';
import { useComparator } from '../../context/ComparatorContext';

const EfficientFrontier = dynamic(() => import('../../components/EfficientFrontier'), { ssr: false });

const MONTHLY_RETURNS: Record<string, Record<string, number | null>> = {
  "2020-01": { Bitcoin: 30.05, Ethereum: 40.31, Solana: null, "S&P 500": -0.18, NASDAQ: 1.98, "Russell 2000": -0.69, "Real Estate": 0.6, Gold: 4.61, Silver: 0.34, "WTI Oil": -5.8 },
  "2020-02": { Bitcoin: -8.13, Ethereum: 23.2, Solana: null, "S&P 500": -8.41, NASDAQ: -6.3, "Russell 2000": -9.05, "Real Estate": 0.47, Gold: -0.13, Silver: -6.87, "WTI Oil": -22.02 },
  "2020-03": { Bitcoin: -25.13, Ethereum: -40.36, Solana: null, "S&P 500": -12.49, NASDAQ: -10.12, "Russell 2000": -23.46, "Real Estate": 0.93, Gold: 0.38, Silver: -16.31, "WTI Oil": -54.18 },
  "2020-04": { Bitcoin: 34.23, Ethereum: 55.64, Solana: null, "S&P 500": 12.68, NASDAQ: 15.45, "Russell 2000": 9.1, "Real Estate": 0.46, Gold: 7.73, Silver: 7.74, "WTI Oil": -197.95 },
  "2020-05": { Bitcoin: 9.53, Ethereum: 11.59, Solana: -20.51, "S&P 500": 4.53, NASDAQ: 6.82, "Russell 2000": 7.71, "Real Estate": 0.92, Gold: 1.28, Silver: 17.15, "WTI Oil": -175.92 },
  "2020-06": { Bitcoin: -3.4, Ethereum: -2.6, Solana: 112.9, "S&P 500": 1.84, NASDAQ: 5.99, "Russell 2000": 6.35, "Real Estate": 0.46, Gold: 2.6, Silver: 1.42, "WTI Oil": 34.16 },
  "2020-07": { Bitcoin: 24.13, Ethereum: 53.33, Solana: 33.33, "S&P 500": 5.51, NASDAQ: 6.82, "Russell 2000": 3.4, "Real Estate": 0.91, Gold: 10.86, Silver: 36.65, "WTI Oil": 6.93 },
  "2020-08": { Bitcoin: 2.85, Ethereum: 25.8, Solana: 68.75, "S&P 500": 7.01, NASDAQ: 9.59, "Russell 2000": 5.63, "Real Estate": 0.9, Gold: -0.3, Silver: 12.2, "WTI Oil": 4.1 },
  "2020-09": { Bitcoin: -7.59, Ethereum: -17.05, Solana: -0.34, "S&P 500": -3.92, NASDAQ: -6.82, "Russell 2000": -4.31, "Real Estate": 1.34, Gold: -4.25, Silver: -13.69, "WTI Oil": -5.59 },
  "2020-10": { Bitcoin: 27.92, Ethereum: 6.11, Solana: -53.04, "S&P 500": -2.77, NASDAQ: -2.29, "Russell 2000": 7.22, "Real Estate": 0.88, Gold: -0.37, Silver: -1.39, "WTI Oil": -11.01 },
  "2020-11": { Bitcoin: 42.81, Ethereum: 61.26, Solana: 37.41, "S&P 500": 10.75, NASDAQ: 11.8, "Russell 2000": 12.7, "Real Estate": 1.31, Gold: -5.57, Silver: -2.87, "WTI Oil": 26.71 },
  "2020-12": { Bitcoin: 47.27, Ethereum: 19.64, Solana: -20.94, "S&P 500": 3.71, NASDAQ: 5.65, "Russell 2000": 8.47, "Real Estate": 0.86, Gold: 6.8, Silver: 16.56, "WTI Oil": 7.02 },
  "2021-01": { Bitcoin: 14.21, Ethereum: 77.81, Solana: 148.34, "S&P 500": -1.11, NASDAQ: 1.42, "Russell 2000": 5.89, "Real Estate": 0.85, Gold: -2.49, Silver: 1.92, "WTI Oil": 7.58 },
  "2021-02": { Bitcoin: 36.31, Ethereum: 8.04, Solana: 295.73, "S&P 500": 2.61, NASDAQ: 0.93, "Russell 2000": 5.2, "Real Estate": 1.27, Gold: -6.56, Silver: -1.0, "WTI Oil": 18.2 },
  "2021-03": { Bitcoin: 30.5, Ethereum: 35.33, Solana: 26.43, "S&P 500": 4.24, NASDAQ: 0.41, "Russell 2000": 0.82, "Real Estate": 1.26, Gold: -0.81, Silver: -7.66, "WTI Oil": -4.0 },
  "2021-04": { Bitcoin: -1.95, Ethereum: 44.68, Solana: 133.48, "S&P 500": 5.24, NASDAQ: 5.4, "Russell 2000": 1.53, "Real Estate": 0.83, Gold: 3.21, Silver: 5.77, "WTI Oil": 7.48 },
  "2021-05": { Bitcoin: -35.4, Ethereum: -2.3, Solana: -20.44, "S&P 500": 0.55, NASDAQ: -1.53, "Russell 2000": 0.53, "Real Estate": 1.23, Gold: 7.7, Silver: 7.42, "WTI Oil": 4.32 },
  "2021-06": { Bitcoin: -6.05, Ethereum: -16.18, Solana: -1.49, "S&P 500": 2.22, NASDAQ: 5.49, "Russell 2000": 1.94, "Real Estate": 1.21, Gold: -7.17, Silver: -6.34, "WTI Oil": 10.79 },
  "2021-07": { Bitcoin: 18.8, Ethereum: 11.26, Solana: -7.05, "S&P 500": 2.27, NASDAQ: 1.16, "Russell 2000": -4.3, "Real Estate": 0.8, Gold: 2.9, Silver: -2.7, "WTI Oil": 0.0 },
  "2021-08": { Bitcoin: 13.32, Ethereum: 35.65, Solana: 201.69, "S&P 500": 2.9, NASDAQ: 4.0, "Russell 2000": 2.19, "Real Estate": 0.79, Gold: -0.06, Silver: -6.17, "WTI Oil": 0.0 },
  "2021-09": { Bitcoin: -7.05, Ethereum: -14.7, Solana: 44.7, "S&P 500": -4.76, NASDAQ: -4.38, "Russell 2000": -2.3, "Real Estate": 0.78, Gold: -3.2, Silver: -9.5, "WTI Oil": 0.0 },
  "2021-10": { Bitcoin: 39.9, Ethereum: 46.59, Solana: 45.33, "S&P 500": 6.91, NASDAQ: 7.27, "Russell 2000": 4.13, "Real Estate": 0.39, Gold: 1.5, Silver: 7.83, "WTI Oil": 0.0 },
  "2021-11": { Bitcoin: -7.0, Ethereum: 7.97, Solana: 1.16, "S&P 500": -0.83, NASDAQ: 0.25, "Russell 2000": -2.23, "Real Estate": 1.17, Gold: -0.39, Silver: -3.64, "WTI Oil": -20.81 },
  "2021-12": { Bitcoin: -18.82, Ethereum: -20.47, Solana: -16.88, "S&P 500": 4.36, NASDAQ: 0.69, "Russell 2000": 0.0, "Real Estate": 0.77, Gold: 2.94, Silver: 3.61, "WTI Oil": 13.61 },
  "2022-01": { Bitcoin: -16.96, Ethereum: -27.1, Solana: -44.41, "S&P 500": -5.26, NASDAQ: -8.98, "Russell 2000": -10.62, "Real Estate": 0.76, Gold: -1.74, Silver: -3.23, "WTI Oil": 17.25 },
  "2022-02": { Bitcoin: 12.3, Ethereum: 8.78, Solana: -7.4, "S&P 500": -3.14, NASDAQ: -3.43, "Russell 2000": 1.24, "Real Estate": 0.76, Gold: 5.81, Silver: 7.85, "WTI Oil": 8.59 },
  "2022-03": { Bitcoin: 5.45, Ethereum: 12.4, Solana: 39.82, "S&P 500": 3.58, NASDAQ: 3.4, "Russell 2000": 1.99, "Real Estate": 1.13, Gold: 1.46, Silver: 1.43, "WTI Oil": 13.42 },
  "2022-04": { Bitcoin: -17.18, Ethereum: -14.26, Solana: -21.0, "S&P 500": -8.8, NASDAQ: -11.81, "Russell 2000": -9.59, "Real Estate": 1.12, Gold: -1.71, Silver: -5.72, "WTI Oil": -3.53 },
  "2022-05": { Bitcoin: -15.75, Ethereum: -31.0, Solana: -53.17, "S&P 500": 0.01, NASDAQ: -4.83, "Russell 2000": -1.78, "Real Estate": 0.37, Gold: -3.16, Silver: -6.57, "WTI Oil": 9.53 },
  "2022-06": { Bitcoin: -37.74, Ethereum: -45.0, Solana: -26.12, "S&P 500": -8.39, NASDAQ: -7.51, "Russell 2000": -7.11, "Real Estate": 0.73, Gold: -1.6, Silver: -5.86, "WTI Oil": 0.0 },
  "2022-07": { Bitcoin: 17.99, Ethereum: 57.58, Solana: 26.34, "S&P 500": 9.11, NASDAQ: 12.35, "Russell 2000": 10.24, "Real Estate": 0.0, Gold: -2.4, Silver: -1.17, "WTI Oil": -6.75 },
  "2022-08": { Bitcoin: -14.09, Ethereum: -7.72, Solana: -24.95, "S&P 500": -4.24, NASDAQ: -4.64, "Russell 2000": -1.96, "Real Estate": 0.0, Gold: -2.94, Silver: -11.66, "WTI Oil": -9.21 },
  "2022-09": { Bitcoin: -3.1, Ethereum: -14.5, Solana: 3.5, "S&P 500": -9.34, NASDAQ: -10.5, "Russell 2000": -9.74, "Real Estate": 0.0, Gold: -2.47, Silver: 6.44, "WTI Oil": -11.24 },
  "2022-10": { Bitcoin: 5.49, Ethereum: 18.52, Solana: -1.43, "S&P 500": 7.99, NASDAQ: 3.9, "Russell 2000": 10.93, "Real Estate": -0.36, Gold: -2.1, Silver: 0.84, "WTI Oil": 8.91 },
  "2022-11": { Bitcoin: -16.21, Ethereum: -17.59, Solana: -58.2, "S&P 500": 5.38, NASDAQ: 4.37, "Russell 2000": 0.87, "Real Estate": -0.36, Gold: 7.41, Silver: 12.1, "WTI Oil": -6.92 },
  "2022-12": { Bitcoin: -3.65, Ethereum: -7.78, Solana: -28.3, "S&P 500": -5.9, NASDAQ: -8.73, "Russell 2000": -5.6, "Real Estate": -0.37, Gold: 3.73, Silver: 11.47, "WTI Oil": -0.36 },
  "2023-01": { Bitcoin: 39.77, Ethereum: 32.78, Solana: 150.57, "S&P 500": 6.18, NASDAQ: 10.68, "Russell 2000": 7.52, "Real Estate": -0.37, Gold: 5.69, Silver: -1.88, "WTI Oil": -2.71 },
  "2023-02": { Bitcoin: 0.09, Ethereum: 1.14, Solana: -10.3, "S&P 500": -2.61, NASDAQ: -1.11, "Russell 2000": -0.05, "Real Estate": -0.37, Gold: -5.17, Silver: -11.57, "WTI Oil": -1.68 },
  "2023-03": { Bitcoin: 22.96, Ethereum: 13.5, Solana: -3.86, "S&P 500": 3.51, NASDAQ: 5.0, "Russell 2000": -6.45, "Real Estate": 0.0, Gold: 7.79, Silver: 15.1, "WTI Oil": -4.62 },
  "2023-04": { Bitcoin: 2.8, Ethereum: 0.44, Solana: 4.35, "S&P 500": 1.46, NASDAQ: 1.7, "Russell 2000": -0.79, "Real Estate": 0.37, Gold: 1.07, Silver: 4.1, "WTI Oil": 4.87 },
  "2023-05": { Bitcoin: -7.01, Ethereum: 3.77, Solana: -10.53, "S&P 500": 0.25, NASDAQ: 5.8, "Russell 2000": 0.17, "Real Estate": 0.37, Gold: -2.37, Silver: -7.35, "WTI Oil": -6.76 },
  "2023-06": { Bitcoin: 12.0, Ethereum: 1.47, Solana: -22.45, "S&P 500": 6.47, NASDAQ: 5.8, "Russell 2000": 6.54, "Real Estate": 0.37, Gold: -1.24, Silver: -1.81, "WTI Oil": -1.88 },
  "2023-07": { Bitcoin: -4.14, Ethereum: -4.14, Solana: 55.73, "S&P 500": 3.11, NASDAQ: 4.73, "Russell 2000": 5.71, "Real Estate": 0.73, Gold: 2.04, Silver: 8.48, "WTI Oil": 16.44 },
  "2023-08": { Bitcoin: -11.29, Ethereum: -11.79, Solana: -16.35, "S&P 500": -1.77, NASDAQ: -2.17, "Russell 2000": -5.57, "Real Estate": 0.73, Gold: -1.02, Silver: -1.74, "WTI Oil": -0.2 },
  "2023-09": { Bitcoin: 3.96, Ethereum: 2.18, Solana: 0.56, "S&P 500": -4.87, NASDAQ: -5.81, "Russell 2000": -5.88, "Real Estate": 0.72, Gold: -4.7, Silver: -8.33, "WTI Oil": 10.97 },
  "2023-10": { Bitcoin: 28.53, Ethereum: 8.8, Solana: 81.11, "S&P 500": -2.2, NASDAQ: -2.78, "Russell 2000": -7.5, "Real Estate": 0.36, Gold: 7.28, Silver: 2.71, "WTI Oil": -10.76 },
  "2023-11": { Bitcoin: 8.78, Ethereum: 15.4, Solana: 61.59, "S&P 500": 8.92, NASDAQ: 10.7, "Russell 2000": 10.04, "Real Estate": 0.71, Gold: 2.79, Silver: 9.96, "WTI Oil": -6.2 },
  "2023-12": { Bitcoin: 12.15, Ethereum: 9.37, Solana: 75.39, "S&P 500": 4.42, NASDAQ: 5.52, "Russell 2000": 13.07, "Real Estate": 0.0, Gold: 1.28, Silver: -5.5, "WTI Oil": -5.34 },
  "2024-01": { Bitcoin: 1.52, Ethereum: -2.5, Solana: -8.49, "S&P 500": 1.59, NASDAQ: 0.58, "Russell 2000": -3.83, "Real Estate": 0.35, Gold: -1.55, Silver: -4.1, "WTI Oil": 5.45 },
  "2024-02": { Bitcoin: 42.68, Ethereum: 51.43, Solana: 39.16, "S&P 500": 5.17, NASDAQ: 6.12, "Russell 2000": 3.1, "Real Estate": 0.7, Gold: 0.64, Silver: 0.0, "WTI Oil": 1.9 },
  "2024-03": { Bitcoin: 13.8, Ethereum: 3.92, Solana: 50.47, "S&P 500": 3.1, NASDAQ: 1.79, "Russell 2000": 5.61, "Real Estate": 0.35, Gold: 9.12, Silver: 10.18, "WTI Oil": 5.32 },
  "2024-04": { Bitcoin: -12.93, Ethereum: -15.0, Solana: -30.34, "S&P 500": -4.29, NASDAQ: -4.41, "Russell 2000": -6.22, "Real Estate": 0.35, Gold: 3.0, Silver: 5.83, "WTI Oil": 0.71 },
  "2024-05": { Bitcoin: 11.34, Ethereum: 26.25, Solana: 23.09, "S&P 500": 5.06, NASDAQ: 6.88, "Russell 2000": 3.87, "Real Estate": 0.7, Gold: 1.3, Silver: 14.34, "WTI Oil": -5.43 },
  "2024-06": { Bitcoin: -7.13, Ethereum: -10.39, Solana: -17.93, "S&P 500": 3.47, NASDAQ: 5.98, "Russell 2000": -1.0, "Real Estate": 0.35, Gold: -0.17, Silver: -4.13, "WTI Oil": 5.12 },
  "2024-07": { Bitcoin: 3.05, Ethereum: -5.92, Solana: 26.52, "S&P 500": 1.13, NASDAQ: -0.75, "Russell 2000": 9.99, "Real Estate": 0.34, Gold: 3.27, Silver: -3.71, "WTI Oil": -4.45 },
  "2024-08": { Bitcoin: -8.74, Ethereum: -20.8, Solana: -23.02, "S&P 500": 2.3, NASDAQ: -0.47, "Russell 2000": -2.27, "Real Estate": 0.0, Gold: 4.25, Silver: 3.0, "WTI Oil": -5.59 },
  "2024-09": { Bitcoin: 7.3, Ethereum: 4.82, Solana: 15.84, "S&P 500": 2.0, NASDAQ: 2.3, "Russell 2000": 0.27, "Real Estate": 0.0, Gold: 4.56, Silver: 9.16, "WTI Oil": -7.24 },
  "2024-10": { Bitcoin: 9.74, Ethereum: -2.08, Solana: 6.88, "S&P 500": 0.53, NASDAQ: 1.43, "Russell 2000": 2.44, "Real Estate": 0.0, Gold: 3.98, Silver: 3.7, "WTI Oil": -1.15 },
  "2024-11": { Bitcoin: 39.36, Ethereum: 22.56, Solana: 25.77, "S&P 500": 3.92, NASDAQ: 4.8, "Russell 2000": 6.47, "Real Estate": -0.34, Gold: -2.13, Silver: -6.23, "WTI Oil": 0.96 },
  "2024-12": { Bitcoin: -3.14, Ethereum: 1.11, Solana: -17.05, "S&P 500": -1.03, NASDAQ: 3.46, "Russell 2000": -3.53, "Real Estate": -0.34, Gold: 0.3, Silver: 2.52, "WTI Oil": 2.63 },
};

const ALL_ASSETS = ['Bitcoin', 'Ethereum', 'Solana', 'S&P 500', 'NASDAQ', 'Russell 2000', 'Real Estate', 'Gold', 'Silver', 'WTI Oil'];
const RISK_FREE_RATE = 0.0437;

// Map between context symbols and portfolio optimizer display names
const SYMBOL_TO_NAME: Record<string, string> = {
  bitcoin: 'Bitcoin', ethereum: 'Ethereum', solana: 'Solana',
  sp500: 'S&P 500', nasdaq: 'NASDAQ', russell2000: 'Russell 2000',
  realEstate: 'Real Estate', gold: 'Gold', silver: 'Silver', wtiOil: 'WTI Oil',
};
const NAME_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(SYMBOL_TO_NAME).map(([k, v]) => [v, k])
);

function getAssetReturns(assetName: string): number[] {
  const returns: number[] = [];
  Object.values(MONTHLY_RETURNS).forEach(month => {
    const val = month[assetName];
    if (val !== null && val !== undefined) {
      returns.push(val / 100);
    }
  });
  return returns;
}

export default function PortfolioOptimizer() {
  const { selectedAssets, setSelectedAssets } = useComparator();
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioResult | null>(null);

  // Derive local name-based selection from context symbols, filtered to assets this page supports
  const selected = selectedAssets
    .map(s => SYMBOL_TO_NAME[s])
    .filter((n): n is string => n !== undefined && ALL_ASSETS.includes(n));

  const toggleAsset = (name: string) => {
    const symbol = NAME_TO_SYMBOL[name];
    if (!symbol) return;
    setSelectedAssets(prev =>
      prev.includes(symbol) ? prev.filter(a => a !== symbol) : [...prev, symbol]
    );
    setSelectedPortfolio(null);
  };

  const result = useMemo(() => {
    if (selected.length < 2) return null;

    const assets: AssetInput[] = selected.map(name => ({
      name,
      returns: getAssetReturns(name),
    }));

    const minLen = Math.min(...assets.map(a => a.returns.length));
    assets.forEach(a => { a.returns = a.returns.slice(a.returns.length - minLen); });

    return calculateEfficientFrontier(assets, RISK_FREE_RATE, 6000, 60);
  }, [selected]);

  const assetStats = useMemo(() => {
    if (selected.length < 2) return [];
    const assets: AssetInput[] = selected.map(name => ({
      name,
      returns: getAssetReturns(name),
    }));
    const minLen = Math.min(...assets.map(a => a.returns.length));
    assets.forEach(a => { a.returns = a.returns.slice(a.returns.length - minLen); });
    return getAssetStats(assets);
  }, [selected]);

  const displayPortfolio = selectedPortfolio || result?.tangency || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Portfolio Optimizer</h1>
        </div>

        <div className="mb-6 p-6 rounded-xl border border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <InfoTip text="Markowitz Modern Portfolio Theory: finds the portfolio mix that maximizes return for a given level of risk, or minimizes risk for a given return target.">Efficient Frontier Analysis</InfoTip>
          </h2>
          <p className="text-gray-400 text-sm mb-4">Select 2+ assets to find the optimal allocation that maximizes your Sharpe ratio.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {ALL_ASSETS.map(name => (
              <button
                key={name}
                onClick={() => toggleAsset(name)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selected.includes(name)
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          {selected.length < 2 && (
            <p className="text-yellow-400 text-sm mt-3">Select at least 2 assets to compute the efficient frontier.</p>
          )}
        </div>

        {result && (
          <>
            <div className="mb-6 p-6 rounded-xl border border-white/10 bg-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">Efficient Frontier</h3>
              <EfficientFrontier
                frontierData={result.frontier}
                tangency={result.tangency}
                minVariance={result.minVariance}
                assets={assetStats}
                riskFreeRate={RISK_FREE_RATE}
                onPortfolioSelect={setSelectedPortfolio}
                selectedPortfolio={selectedPortfolio}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="p-6 rounded-xl border border-white/10 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {selectedPortfolio ? 'Selected Portfolio' : 'Optimal Portfolio (Max Sharpe)'}
                </h3>
                {displayPortfolio && (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Return</div>
                        <div className="text-lg font-bold text-green-400">{(displayPortfolio.expectedReturn * 100).toFixed(1)}%</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Risk</div>
                        <div className="text-lg font-bold text-orange-400">{(displayPortfolio.volatility * 100).toFixed(1)}%</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Sharpe</div>
                        <div className="text-lg font-bold text-blue-400">{displayPortfolio.sharpeRatio.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(displayPortfolio.weights)
                        .sort(([, a], [, b]) => b - a)
                        .map(([asset, weight]) => (
                          <div key={asset} className="flex items-center gap-3">
                            <span className="text-sm text-gray-300 w-24 truncate">{asset}</span>
                            <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${Math.max(weight * 100, 0.5)}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono text-white w-14 text-right">{(weight * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 rounded-xl border border-white/10 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-4">Min Variance Portfolio</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Return</div>
                    <div className="text-lg font-bold text-green-400">{(result.minVariance.expectedReturn * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Risk</div>
                    <div className="text-lg font-bold text-orange-400">{(result.minVariance.volatility * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Sharpe</div>
                    <div className="text-lg font-bold text-blue-400">{result.minVariance.sharpeRatio.toFixed(2)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(result.minVariance.weights)
                    .sort(([, a], [, b]) => b - a)
                    .map(([asset, weight]) => (
                      <div key={asset} className="flex items-center gap-3">
                        <span className="text-sm text-gray-300 w-24 truncate">{asset}</span>
                        <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: `${Math.max(weight * 100, 0.5)}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-white w-14 text-right">{(weight * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/risk-analysis" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium">
            <Zap className="w-5 h-5" />
            Risk Analysis
          </Link>
          <Link href="/" className="flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
