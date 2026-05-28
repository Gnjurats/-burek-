'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';

interface CpiEntry {
  date: string; // "2014-01"
  cpi: number;
}

interface AssetConfig {
  name: string;
  symbol: string;
  color: string;
  category: 'crypto' | 'stocks' | 'commodities';
}

const ASSETS: AssetConfig[] = [
  { name: 'Bitcoin', symbol: 'bitcoin', color: '#F7931A', category: 'crypto' },
  { name: 'Ethereum', symbol: 'ethereum', color: '#627EEA', category: 'crypto' },
  { name: 'Solana', symbol: 'solana', color: '#9945FF', category: 'crypto' },
  { name: 'Cardano', symbol: 'cardano', color: '#0033AD', category: 'crypto' },
  { name: 'Chainlink', symbol: 'chainlink', color: '#375BD2', category: 'crypto' },
  { name: 'Polygon', symbol: 'polygon', color: '#8247E5', category: 'crypto' },
  { name: 'Avalanche', symbol: 'avalanche', color: '#E84142', category: 'crypto' },
  { name: 'S&P 500', symbol: 'sp500', color: '#2563EB', category: 'stocks' },
  { name: 'NASDAQ', symbol: 'nasdaq', color: '#00D4FF', category: 'stocks' },
  { name: 'Russell 2000', symbol: 'russell2000', color: '#FF6B6B', category: 'stocks' },
  { name: 'QQQ', symbol: 'qqq', color: '#10b981', category: 'stocks' },
  { name: 'VTI', symbol: 'vti', color: '#06b6d4', category: 'stocks' },
  { name: 'FTSE 100', symbol: 'ftse100', color: '#dc2626', category: 'stocks' },
  { name: 'Nikkei 225', symbol: 'nikkei225', color: '#f43f5e', category: 'stocks' },
  { name: 'DAX', symbol: 'dax', color: '#a855f7', category: 'stocks' },
  { name: 'Real Estate', symbol: 'realEstate', color: '#8B5CF6', category: 'stocks' },
  { name: 'Gold', symbol: 'gold', color: '#FFD700', category: 'commodities' },
  { name: 'Silver', symbol: 'silver', color: '#C0C0C0', category: 'commodities' },
  { name: 'WTI Oil', symbol: 'wtiOil', color: '#8B4513', category: 'commodities' },
  { name: 'Copper', symbol: 'copper', color: '#b87333', category: 'commodities' },
  { name: 'Natural Gas', symbol: 'naturalGas', color: '#64748b', category: 'commodities' },
];

// Yearly indexed performance (base 100 at start)
const PERFORMANCE: Record<number, Record<string, number | undefined>> = {
  2014: { bitcoin: 100, ethereum: 100, sp500: 100, gold: 100, realEstate: 100, solana: undefined, wtiOil: 100, silver: 100, nasdaq: 100, russell2000: 100, cardano: 100, polygon: 100, chainlink: 100, avalanche: undefined, ftse100: 100, nikkei225: 100, dax: 100, copper: 100, naturalGas: 100, qqq: 100, vti: 100 },
  2015: { bitcoin: 135.2, ethereum: 100, sp500: 99.3, gold: 88.4, realEstate: 105.4, solana: undefined, wtiOil: 69.5, silver: 86.5, nasdaq: 108.3, russell2000: 94.1, cardano: 100, polygon: 100, chainlink: 100, avalanche: undefined, ftse100: 100, nikkei225: 100, dax: 100, copper: 100, naturalGas: 100, qqq: 100, vti: 100 },
  2016: { bitcoin: 304.4, ethereum: 878.5, sp500: 108.7, gold: 96.1, realEstate: 111.4, solana: undefined, wtiOil: 100.8, silver: 100.1, nasdaq: 114.7, russell2000: 112.7, cardano: 100, polygon: 100, chainlink: 100, avalanche: undefined, ftse100: 100, nikkei225: 100, dax: 100, copper: 100, naturalGas: 100, qqq: 100, vti: 100 },
  2017: { bitcoin: 4451.6, ethereum: 8129.0, sp500: 129.9, gold: 108.2, realEstate: 118.1, solana: undefined, wtiOil: 113.4, silver: 105.6, nasdaq: 150.9, russell2000: 127.5, cardano: 100, polygon: 100, chainlink: 100, avalanche: undefined, ftse100: 100, nikkei225: 100, dax: 100, copper: 100, naturalGas: 100, qqq: 100, vti: 100 },
  2018: { bitcoin: 1176.4, ethereum: 1429.0, sp500: 121.8, gold: 106.7, realEstate: 123.5, solana: undefined, wtiOil: 85.3, silver: 96.9, nasdaq: 149.4, russell2000: 111.9, cardano: 100, polygon: 100, chainlink: 100, avalanche: undefined, ftse100: 100, nikkei225: 100, dax: 100, copper: 100, naturalGas: 100, qqq: 100, vti: 100 },
  2019: { bitcoin: 2262.6, ethereum: 1387.1, sp500: 157.0, gold: 127.0, realEstate: 128.3, solana: undefined, wtiOil: 114.6, silver: 111.8, nasdaq: 206.0, russell2000: 138.5, cardano: 100, polygon: 100, chainlink: 100, avalanche: undefined, ftse100: 100, nikkei225: 100, dax: 100, copper: 100, naturalGas: 100, qqq: 100, vti: 100 },
  2020: { bitcoin: 9119.8, ethereum: 7925.8, sp500: 182.5, gold: 158.3, realEstate: 139.8, solana: 100, wtiOil: 91.1, silver: 165.3, nasdaq: 303.8, russell2000: 164.2, cardano: 289, polygon: 119, chainlink: 417, avalanche: 100, ftse100: 87, nikkei225: 105, dax: 93, copper: 112, naturalGas: 116, qqq: 128, vti: 115 },
  2021: { bitcoin: 14563.5, ethereum: 39591.4, sp500: 231.5, gold: 150.0, realEstate: 163.3, solana: 11289.1, wtiOil: 141.2, silver: 145.9, nasdaq: 391.3, russell2000: 186.0, cardano: 2911, polygon: 15812, chainlink: 1151, avalanche: 2534, ftse100: 101, nikkei225: 124, dax: 120, copper: 158, naturalGas: 183, qqq: 181, vti: 149 },
  2022: { bitcoin: 5203.5, ethereum: 12860.2, sp500: 186.5, gold: 152.1, realEstate: 177.7, solana: 659.6, wtiOil: 150.7, silver: 150.0, nasdaq: 258.0, russell2000: 145.8, cardano: 556, polygon: 4750, chainlink: 312, avalanche: 252, ftse100: 102, nikkei225: 112, dax: 105, copper: 137, naturalGas: 264, qqq: 119, vti: 118 },
  2023: { bitcoin: 13293.4, ethereum: 24494.6, sp500: 231.8, gold: 172.2, realEstate: 187.3, solana: 6752.3, wtiOil: 134.5, silver: 149.5, nasdaq: 396.7, russell2000: 167.8, cardano: 1333, polygon: 6125, chainlink: 893, avalanche: 924, ftse100: 106, nikkei225: 144, dax: 126, copper: 139, naturalGas: 121, qqq: 183, vti: 147 },
  2024: { bitcoin: 29737.4, ethereum: 46236.6, sp500: 291.6, gold: 279.5, realEstate: 196.4, solana: 12653.6, wtiOil: 131.8, silver: 186.1, nasdaq: 493.8, russell2000: 183.8, cardano: 733, polygon: 2000, chainlink: 665, avalanche: 502, ftse100: 114, nikkei225: 172, dax: 147, copper: 147, naturalGas: 144, qqq: 226, vti: 181 },
};

type Period = '10Y' | '5Y' | '1Y';

const PERIOD_CONFIG: Record<Period, { startYear: number; endYear: number; label: string }> = {
  '10Y': { startYear: 2014, endYear: 2024, label: '10 Years (2014–2024)' },
  '5Y': { startYear: 2019, endYear: 2024, label: '5 Years (2019–2024)' },
  '1Y': { startYear: 2023, endYear: 2024, label: '1 Year (2023–2024)' },
};

const CATEGORY_COLORS: Record<string, string> = {
  crypto: '#f59e0b',
  stocks: '#3b82f6',
  commodities: '#10b981',
};

export default function InflationHedgeDashboard() {
  const [cpiData, setCpiData] = useState<CpiEntry[]>([]);
  const [period, setPeriod] = useState<Period>('10Y');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([
    'bitcoin', 'sp500', 'gold', 'nasdaq', 'realEstate', 'silver',
  ]);
  const [growthAsset, setGrowthAsset] = useState('sp500');

  useEffect(() => {
    fetch('/data/cpi_monthly.json')
      .then(r => r.json())
      .then(setCpiData);
  }, []);

  // CPI lookup: year -> Dec CPI value (use Jan for start year)
  const cpiByYear = useMemo(() => {
    const map: Record<number, { jan: number; dec: number }> = {};
    cpiData.forEach(entry => {
      const year = parseInt(entry.date.split('-')[0]);
      const month = parseInt(entry.date.split('-')[1]);
      if (!map[year]) map[year] = { jan: 0, dec: 0 };
      if (month === 1) map[year].jan = entry.cpi;
      if (month === 12) map[year].dec = entry.cpi;
    });
    return map;
  }, [cpiData]);

  const { startYear, endYear } = PERIOD_CONFIG[period];

  // Cumulative inflation over the period
  const cumulativeInflation = useMemo(() => {
    const startCpi = cpiByYear[startYear]?.jan;
    const endCpi = cpiByYear[endYear]?.dec;
    if (!startCpi || !endCpi) return 0;
    return (endCpi / startCpi - 1) * 100;
  }, [cpiByYear, startYear, endYear]);

  // Compute nominal and real returns for each asset
  const assetReturns = useMemo(() => {
    const startCpi = cpiByYear[startYear]?.jan;
    const endCpi = cpiByYear[endYear]?.dec;
    if (!startCpi || !endCpi) return [];

    const inflationRate = endCpi / startCpi - 1;

    return ASSETS.map(asset => {
      const startVal = PERFORMANCE[startYear]?.[asset.symbol];
      const endVal = PERFORMANCE[endYear]?.[asset.symbol];

      if (startVal === undefined || endVal === undefined) {
        return { ...asset, nominal: null, real: null, beatsInflation: false };
      }

      const nominalReturn = (endVal / startVal - 1) * 100;
      // Fisher equation: real = (1 + nominal) / (1 + inflation) - 1
      const realReturn = ((1 + nominalReturn / 100) / (1 + inflationRate) - 1) * 100;

      return {
        ...asset,
        nominal: nominalReturn,
        real: realReturn,
        beatsInflation: realReturn > 0,
      };
    }).filter(a => a.nominal !== null);
  }, [cpiByYear, startYear, endYear]);

  // Bar chart data: only selected assets
  const barChartData = useMemo(() => {
    return assetReturns
      .filter(a => selectedAssets.includes(a.symbol))
      .map(a => ({
        name: a.name,
        nominal: Math.round(a.nominal!),
        real: Math.round(a.real!),
        color: a.color,
      }));
  }, [assetReturns, selectedAssets]);

  // Growth chart: $10k nominal vs real for chosen asset
  const growthData = useMemo(() => {
    const startCpi = cpiByYear[startYear]?.jan;
    if (!startCpi) return [];

    const years: number[] = [];
    for (let y = startYear; y <= endYear; y++) years.push(y);

    return years.map(y => {
      const val = PERFORMANCE[y]?.[growthAsset];
      const startVal = PERFORMANCE[startYear]?.[growthAsset];
      if (val === undefined || startVal === undefined) return null;

      const nominal = (val / startVal) * 10000;
      const yearCpi = cpiByYear[y]?.dec || cpiByYear[y]?.jan;
      if (!yearCpi) return null;

      const inflationFactor = yearCpi / startCpi;
      const real = nominal / inflationFactor;

      return {
        year: y,
        nominal: Math.round(nominal),
        real: Math.round(real),
        inflation: Math.round(10000 * inflationFactor),
      };
    }).filter(Boolean);
  }, [cpiByYear, startYear, endYear, growthAsset]);

  // Ranking: all assets sorted by real return
  const ranking = useMemo(() => {
    return [...assetReturns]
      .filter(a => a.real !== null)
      .sort((a, b) => b.real! - a.real!);
  }, [assetReturns]);

  const toggleAsset = (symbol: string) => {
    setSelectedAssets(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  if (cpiData.length === 0) {
    return <div className="text-gray-400 text-center py-12">Loading CPI data...</div>;
  }

  const formatLargeNumber = (val: number) => {
    if (Math.abs(val) >= 10000) return `${(val / 1000).toFixed(0)}k`;
    if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toFixed(0);
  };

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        {(Object.keys(PERIOD_CONFIG) as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              period === p
                ? 'border-amber-500 bg-amber-500/20 text-white'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
            }`}
          >
            {p}
          </button>
        ))}
        <span className="text-gray-500 text-sm ml-2">{PERIOD_CONFIG[period].label}</span>
      </div>

      {/* Inflation summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
          <p className="text-amber-400 text-sm font-medium">Cumulative Inflation</p>
          <p className="text-2xl font-bold text-white mt-1">+{cumulativeInflation.toFixed(1)}%</p>
          <p className="text-gray-400 text-xs mt-1">US CPI, {startYear}–{endYear}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-gray-400 text-sm font-medium">$10,000 Purchasing Power</p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            ${(10000 / (1 + cumulativeInflation / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-gray-400 text-xs mt-1">in {startYear} dollars by {endYear}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-gray-400 text-sm font-medium">Assets Beating Inflation</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {ranking.filter(a => a.beatsInflation).length} / {ranking.length}
          </p>
          <p className="text-gray-400 text-xs mt-1">positive real return</p>
        </div>
      </div>

      {/* Asset selector */}
      <div className="p-5 rounded-xl border border-white/10 bg-white/5">
        <h3 className="text-sm font-semibold text-white mb-3">Select Assets to Compare</h3>
        <div className="flex flex-wrap gap-2">
          {ASSETS.map(asset => {
            const hasData = PERFORMANCE[startYear]?.[asset.symbol] !== undefined && PERFORMANCE[endYear]?.[asset.symbol] !== undefined;
            if (!hasData) return null;
            return (
              <button
                key={asset.symbol}
                onClick={() => toggleAsset(asset.symbol)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  selectedAssets.includes(asset.symbol)
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-white/5 bg-white/[0.02] text-gray-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: asset.color }} />
                {asset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Nominal vs Real Return Bar Chart */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/5">
        <h3 className="text-lg font-bold text-white mb-1">Nominal vs Real Return</h3>
        <p className="text-gray-400 text-sm mb-4">
          Nominal return is what you see on paper. Real return is what you actually gained in purchasing power after accounting for {cumulativeInflation.toFixed(1)}% inflation.
        </p>
        {barChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(300, barChartData.length * 50)}>
            <BarChart data={barChartData} layout="vertical" margin={{ left: 80, right: 30, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `${formatLargeNumber(v)}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={75} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                formatter={(value, name) => [
                  `${formatLargeNumber(Number(value))}%`,
                  name === 'nominal' ? 'Nominal Return' : 'Real Return'
                ]}
              />
              <Legend formatter={(value: string) => value === 'nominal' ? 'Nominal Return' : 'Real Return'} />
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" />
              <Bar dataKey="nominal" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={16} />
              <Bar dataKey="real" radius={[0, 4, 4, 0]} barSize={16}>
                {barChartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.real >= 0 ? '#34d399' : '#f87171'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">Select assets above to compare</p>
        )}
      </div>

      {/* 2. Cumulative Growth Chart */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">$10,000 Growth: Nominal vs Real</h3>
            <p className="text-gray-400 text-sm">See how inflation erodes actual purchasing power over time</p>
          </div>
          <select
            value={growthAsset}
            onChange={e => setGrowthAsset(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            {ASSETS.filter(a => PERFORMANCE[startYear]?.[a.symbol] !== undefined).map(a => (
              <option key={a.symbol} value={a.symbol} className="bg-slate-800">{a.name}</option>
            ))}
          </select>
        </div>
        {growthData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={growthData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                formatter={(value, name) => {
                  const labels: Record<string, string> = {
                    nominal: 'Nominal Value',
                    real: 'Real Value (inflation-adjusted)',
                    inflation: 'Inflation Baseline ($10k)',
                  };
                  return [`$${Number(value).toLocaleString()}`, labels[String(name)] || String(name)];
                }}
              />
              <Legend formatter={(v: string) => {
                const labels: Record<string, string> = {
                  nominal: 'Nominal Value',
                  real: 'Real (purchasing power)',
                  inflation: 'Inflation Baseline',
                };
                return labels[v] || v;
              }} />
              <Line type="monotone" dataKey="nominal" stroke="#60a5fa" strokeWidth={2.5} dot={{ fill: '#60a5fa', r: 3 }} />
              <Line type="monotone" dataKey="real" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 3 }} />
              <Line type="monotone" dataKey="inflation" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No data for selected asset in this period</p>
        )}
      </div>

      {/* 3. Inflation-Hedge Ranking */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/5">
        <h3 className="text-lg font-bold text-white mb-1">Inflation-Hedge Ranking</h3>
        <p className="text-gray-400 text-sm mb-4">
          All assets ranked by real (inflation-adjusted) return. Green = beat inflation. Red = lost purchasing power.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-gray-400 font-medium">#</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Asset</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Category</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium">Nominal</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium">Inflation</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium">Real Return</th>
                <th className="text-center py-2 px-3 text-gray-400 font-medium">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((asset, idx) => (
                <tr key={asset.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 text-gray-500 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
                      <span className="text-white font-medium">{asset.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      backgroundColor: `${CATEGORY_COLORS[asset.category]}20`,
                      color: CATEGORY_COLORS[asset.category],
                    }}>
                      {asset.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-blue-400">
                    {asset.nominal! >= 0 ? '+' : ''}{formatLargeNumber(asset.nominal!)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                    -{cumulativeInflation.toFixed(1)}%
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono font-semibold ${asset.real! >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {asset.real! >= 0 ? '+' : ''}{formatLargeNumber(asset.real!)}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      asset.beatsInflation
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {asset.beatsInflation ? 'Hedge' : 'No hedge'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Inflation hurdle line */}
        <div className="mt-4 flex items-center gap-2 text-xs text-amber-400">
          <span className="w-8 h-0.5 bg-amber-400" />
          Inflation hurdle: {cumulativeInflation.toFixed(1)}% — assets must exceed this nominal return to preserve purchasing power
        </div>
      </div>
    </div>
  );
}
