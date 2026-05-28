'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Calculator, ArrowLeft, Coins, Activity, Clock } from 'lucide-react';
import InfoTip from '../../components/Tooltip';

type PriceRow = Record<string, number | null>;
type PriceData = Record<string, PriceRow>; // month -> { symbol -> price }

interface DCAResult {
  totalInvested: number;
  finalValue: number;
  totalReturn: number;
  returnPercentage: number;
  sharesAcquired: number;
  averageCost: number;
  monthlyData: Array<{
    month: string;
    price: number;
    sharesBought: number;
    totalShares: number;
    totalInvested: number;
    portfolioValue: number;
  }>;
}

interface Investment {
  name: string;
  symbol: string;
  color: string;
  description: string;
}

// Build flat list of all months 2014-01 to 2024-12
const ALL_MONTHS: string[] = [];
for (let y = 2014; y <= 2024; y++) {
  for (let m = 1; m <= 12; m++) {
    ALL_MONTHS.push(`${y}-${String(m).padStart(2, '0')}`);
  }
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonthLabel(dateStr: string): string {
  const [y, m] = dateStr.split('-');
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

function monthsBetween(start: string, end: string): string {
  const si = ALL_MONTHS.indexOf(start);
  const ei = ALL_MONTHS.indexOf(end);
  const total = ei - si;
  const years = Math.floor(total / 12);
  const months = total % 12;
  if (years > 0 && months > 0) return `${years}y ${months}m`;
  if (years > 0) return `${years}y`;
  return `${months}m`;
}

export default function DCACalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState<number>(500);
  const [selectedAsset, setSelectedAsset] = useState<string>('bitcoin');
  const [startIdx, setStartIdx] = useState<number>(0);
  const [endIdx, setEndIdx] = useState<number>(ALL_MONTHS.length - 1);
  const [priceData, setPriceData] = useState<PriceData>({});
  const [loading, setLoading] = useState(true);

  const startDate = ALL_MONTHS[startIdx];
  const endDate = ALL_MONTHS[endIdx];

  // Load price data
  useEffect(() => {
    fetch('/data/monthly_prices.json')
      .then(r => r.json())
      .then((data: PriceData) => {
        setPriceData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Compute per-asset first/last available month index
  const assetBounds = useMemo(() => {
    const bounds: Record<string, { first: number; last: number }> = {};
    const months = Object.keys(priceData).sort();
    if (months.length === 0) return bounds;

    // Get all asset keys from the first month entry
    const assets = Object.keys(priceData[months[0]] || {});
    for (const asset of assets) {
      let first = -1;
      let last = -1;
      for (let i = 0; i < ALL_MONTHS.length; i++) {
        const m = ALL_MONTHS[i];
        const price = priceData[m]?.[asset];
        if (price !== null && price !== undefined && price > 0) {
          if (first === -1) first = i;
          last = i;
        }
      }
      if (first !== -1) {
        bounds[asset] = { first, last };
      }
    }
    return bounds;
  }, [priceData]);

  // Clamp slider when asset changes
  useEffect(() => {
    const b = assetBounds[selectedAsset];
    if (!b) return;
    if (startIdx < b.first) setStartIdx(b.first);
    if (endIdx > b.last) setEndIdx(b.last);
    if (startIdx > b.last) setStartIdx(b.first);
    if (endIdx < b.first) setEndIdx(b.last);
  }, [selectedAsset, assetBounds]);

  const minIdx = assetBounds[selectedAsset]?.first ?? 0;
  const maxIdx = assetBounds[selectedAsset]?.last ?? ALL_MONTHS.length - 1;

  const investments: Investment[] = [
    { name: 'Bitcoin', symbol: 'bitcoin', color: '#F7931A', description: 'The first and most well-known cryptocurrency' },
    { name: 'Ethereum', symbol: 'ethereum', color: '#627EEA', description: 'Leading smart contract platform' },
    { name: 'Solana', symbol: 'solana', color: '#9945FF', description: 'High-performance Layer 1 blockchain' },
    { name: 'Cardano', symbol: 'cardano', color: '#0033AD', description: 'Proof-of-stake blockchain platform' },
    { name: 'Polygon', symbol: 'polygon', color: '#8247E5', description: 'Ethereum scaling solution' },
    { name: 'Chainlink', symbol: 'chainlink', color: '#375BD2', description: 'Decentralized oracle network' },
    { name: 'Avalanche', symbol: 'avalanche', color: '#E84142', description: 'Fast smart contract platform' },
    { name: 'S&P 500', symbol: 'sp500', color: '#2563EB', description: 'Index of the 500 largest US companies' },
    { name: 'NASDAQ', symbol: 'nasdaq', color: '#00D4FF', description: 'US technology stock index' },
    { name: 'Russell 2000', symbol: 'russell2000', color: '#06B6D4', description: 'US small-cap stock index' },
    { name: 'FTSE 100', symbol: 'ftse100', color: '#DC2626', description: 'UK blue-chip stock index' },
    { name: 'Nikkei 225', symbol: 'nikkei225', color: '#F43F5E', description: 'Japanese stock market index' },
    { name: 'DAX', symbol: 'dax', color: '#FBBF24', description: 'German stock market index' },
    { name: 'QQQ ETF', symbol: 'qqq', color: '#10B981', description: 'NASDAQ-100 tracking ETF' },
    { name: 'VTI ETF', symbol: 'vti', color: '#14B8A6', description: 'Vanguard Total Stock Market ETF' },
    { name: 'Gold', symbol: 'gold', color: '#FFD700', description: 'Precious metal, traditional safe haven' },
    { name: 'Silver', symbol: 'silver', color: '#C0C0C0', description: 'Precious metal, industrial & investment' },
    { name: 'WTI Oil', symbol: 'wtiOil', color: '#78350F', description: 'West Texas Intermediate crude oil' },
    { name: 'Copper', symbol: 'copper', color: '#B45309', description: 'Industrial metal, economic indicator' },
    { name: 'Natural Gas', symbol: 'naturalGas', color: '#65A30D', description: 'Energy commodity' },
    { name: 'Real Estate', symbol: 'realEstate', color: '#8B5CF6', description: 'US residential real estate index' }
  ];

  const calculateDCA = (): DCAResult => {
    const monthlyData: Array<{
      month: string;
      price: number;
      sharesBought: number;
      totalShares: number;
      totalInvested: number;
      portfolioValue: number;
    }> = [];

    let totalInvested = 0;
    let totalShares = 0;

    for (let i = startIdx; i <= endIdx; i++) {
      const month = ALL_MONTHS[i];
      const price = priceData[month]?.[selectedAsset];

      if (price !== null && price !== undefined && price > 0) {
        const sharesBought = monthlyAmount / price;
        totalShares += sharesBought;
        totalInvested += monthlyAmount;

        monthlyData.push({
          month,
          price,
          sharesBought,
          totalShares,
          totalInvested,
          portfolioValue: totalShares * price
        });
      }
    }

    const finalPrice = monthlyData[monthlyData.length - 1]?.price || 0;
    const finalValue = totalShares * finalPrice;
    const totalReturn = finalValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const averageCost = totalShares > 0 ? totalInvested / totalShares : 0;

    return {
      totalInvested,
      finalValue,
      totalReturn,
      returnPercentage,
      sharesAcquired: totalShares,
      averageCost,
      monthlyData
    };
  };

  const dcaResult = calculateDCA();
  const selectedInvestment = investments.find(inv => inv.symbol === selectedAsset);

  const chartData = dcaResult.monthlyData.map(data => ({
    month: data.month,
    invested: data.totalInvested,
    value: data.portfolioValue
  }));

  // Show note if the selected range starts before the asset's first available data
  const assetStartNote = (() => {
    const b = assetBounds[selectedAsset];
    if (!b) return null;
    if (startIdx < b.first) {
      return `Note: ${selectedInvestment?.name} data starts from ${formatMonthLabel(ALL_MONTHS[b.first])}. DCA contributions begin from that date.`;
    }
    return null;
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading price data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Back to Comparator
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 rounded-full p-3">
              <Calculator className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                DCA Calculator
              </h1>
              <p className="text-gray-300">
                Dollar Cost Averaging - Compare 21 assets with real historical data (2014-2024)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center"><InfoTip text="Investing a fixed amount regularly (e.g. $500/month) regardless of price. You buy more when prices are low, less when high — reducing timing risk.">What is Dollar Cost Averaging?</InfoTip></h2>
          <p className="text-center text-gray-300 mb-6">
            DCA is an investment strategy where you invest a fixed amount regularly, regardless of market price.
            This reduces the impact of volatility and can lower your average cost per share over time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Regular Investment</h3>
              <p className="text-sm text-gray-300">Invest the same amount every month</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Reduce Volatility</h3>
              <p className="text-sm text-gray-300">Buy more when prices are low, less when high</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Coins className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Lower Average Cost</h3>
              <p className="text-sm text-gray-300">Potentially better than trying to time the market</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Monthly Investment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500"
              />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Investment Asset
            </label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <optgroup label="Cryptocurrencies">
                <option value="bitcoin">Bitcoin</option>
                <option value="ethereum">Ethereum</option>
                <option value="solana">Solana</option>
                <option value="cardano">Cardano</option>
                <option value="polygon">Polygon</option>
                <option value="chainlink">Chainlink</option>
                <option value="avalanche">Avalanche</option>
              </optgroup>
              <optgroup label="Stock Indices & ETFs">
                <option value="sp500">S&P 500</option>
                <option value="nasdaq">NASDAQ</option>
                <option value="russell2000">Russell 2000</option>
                <option value="ftse100">FTSE 100</option>
                <option value="nikkei225">Nikkei 225</option>
                <option value="dax">DAX</option>
                <option value="qqq">QQQ ETF</option>
                <option value="vti">VTI ETF</option>
              </optgroup>
              <optgroup label="Commodities">
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="wtiOil">WTI Oil</option>
                <option value="copper">Copper</option>
                <option value="naturalGas">Natural Gas</option>
              </optgroup>
              <optgroup label="Real Estate">
                <option value="realEstate">US Real Estate</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Time Range Slider */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Investment Period</label>
            <span className="text-sm text-gray-400">{monthsBetween(startDate, endDate)} span</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-blue-400">{formatMonthLabel(startDate)}</span>
            <span className="text-gray-500 mx-3">&rarr;</span>
            <span className="text-lg font-semibold text-emerald-400">{formatMonthLabel(endDate)}</span>
          </div>

          {/* Dual range slider */}
          <div className="relative h-12 flex items-center">
            {/* Track background */}
            <div className="absolute left-0 right-0 h-2 bg-white/10 rounded-full" />
            {/* Active range highlight — percentages relative to the SAME min/max the inputs use */}
            {maxIdx > minIdx && (
              <div
                className="absolute h-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full pointer-events-none"
                style={{
                  left: `${((startIdx - minIdx) / (maxIdx - minIdx)) * 100}%`,
                  width: `${((endIdx - startIdx) / (maxIdx - minIdx)) * 100}%`,
                }}
              />
            )}
            {/* Start handle — higher z when past midpoint so it stays grabbable near the end */}
            <input
              type="range"
              min={minIdx}
              max={maxIdx}
              step={1}
              value={startIdx}
              onChange={(e) => {
                const v = Math.min(Number(e.target.value), endIdx - 1);
                setStartIdx(v);
              }}
              style={{ zIndex: startIdx > minIdx + (maxIdx - minIdx) / 2 ? 30 : 10 }}
              className="absolute w-full h-12 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-grab"
              aria-label="Start month"
            />
            {/* End handle */}
            <input
              type="range"
              min={minIdx}
              max={maxIdx}
              step={1}
              value={endIdx}
              onChange={(e) => {
                const v = Math.max(Number(e.target.value), startIdx + 1);
                setEndIdx(v);
              }}
              className="absolute w-full h-12 appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-grab"
              aria-label="End month"
            />
          </div>

          {/* Year markers */}
          <div className="flex justify-between mt-1 px-1">
            {[2014, 2016, 2018, 2020, 2022, 2024].map(year => (
              <span key={year} className="text-xs text-gray-500">{year}</span>
            ))}
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: 'Last 2Y', startOff: -24 },
              { label: 'Last 5Y', startOff: -60 },
              { label: 'Max', startOff: 0 },
            ].map(preset => {
              const pEnd = maxIdx;
              const pStart = preset.startOff === 0 ? minIdx : Math.max(minIdx, maxIdx + preset.startOff);
              return (
                <button
                  key={preset.label}
                  onClick={() => { setStartIdx(pStart); setEndIdx(pEnd); }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    startIdx === pStart && endIdx === pEnd
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {assetStartNote && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-blue-300 text-sm">{assetStartNote}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              <h3 className="font-bold text-green-400"><InfoTip text="The sum of all your monthly contributions over the selected period.">Total Invested</InfoTip></h3>
            </div>
            <p className="text-2xl font-bold text-white">${dcaResult.totalInvested.toLocaleString()}</p>
            <p className="text-sm text-gray-300">Over {dcaResult.monthlyData.length} months</p>
          </div>

          <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h3 className="font-bold text-blue-400"><InfoTip text="What all your accumulated units are worth at the current market price.">Portfolio Value</InfoTip></h3>
            </div>
            <p className="text-2xl font-bold text-white">${dcaResult.finalValue.toLocaleString()}</p>
            <p className="text-sm text-gray-300">Current market value</p>
          </div>

          <div className={`backdrop-blur-sm rounded-xl p-6 border ${
            dcaResult.totalReturn >= 0
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className={`w-6 h-6 ${dcaResult.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
              <h3 className={`font-bold ${dcaResult.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                Total Return
              </h3>
            </div>
            <p className={`text-2xl font-bold ${dcaResult.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {dcaResult.totalReturn >= 0 ? '+' : ''}${dcaResult.totalReturn.toLocaleString()}
            </p>
            <p className="text-sm text-gray-300">
              {dcaResult.returnPercentage >= 0 ? '+' : ''}{dcaResult.returnPercentage.toFixed(1)}% return
            </p>
          </div>

          <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="w-6 h-6 text-purple-400" />
              <h3 className="font-bold text-purple-400"><InfoTip text="Your average purchase price per unit. DCA typically lowers this compared to buying all at once.">Average Cost</InfoTip></h3>
            </div>
            <p className="text-2xl font-bold text-white">${dcaResult.averageCost.toLocaleString()}</p>
            <p className="text-sm text-gray-300">
              {dcaResult.sharesAcquired.toFixed(4)} {selectedInvestment?.name} units
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-bold mb-4">DCA Performance Over Time</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    const formatted = `$${Number(value).toLocaleString()}`;
                    if (name === 'invested') return [formatted, 'Total Invested'];
                    if (name === 'value') return [formatted, 'Portfolio Value'];
                    return [formatted, name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="invested"
                  stroke="#64748b"
                  strokeWidth={2}
                  name="Total Invested"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={selectedInvestment?.color || '#3B82F6'}
                  strokeWidth={3}
                  name="Portfolio Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-8 border border-green-500/30 text-center mt-8">
          <h3 className="text-2xl font-bold mb-4">Ready to Compare More Assets?</h3>
          <p className="text-gray-300 mb-6">
            Try different assets, time periods, and investment amounts to see how DCA would have performed.
            Compare multiple strategies side by side with our main investment comparator.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/risk-analysis"
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              <Activity className="w-5 h-5" />
              Analyze Risk Metrics
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <TrendingUp className="w-5 h-5" />
              Explore Investment Comparator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
