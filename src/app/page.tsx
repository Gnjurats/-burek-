'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Home, Coins, Fuel, Shield, Activity, Building2, Calculator, AlertTriangle, Download, Loader2, Play, Bot } from 'lucide-react';
import dynamic from 'next/dynamic';
import InfoTip from '../components/Tooltip';
import GuidedTour from '../components/GuidedTour';
import HelpModal from '../components/HelpModal';
import { generatePDF } from '../lib/pdfExport';

const HistoricalEvents = dynamic(() => import('../components/HistoricalEvents'), { ssr: false });

interface InvestmentData {
  year: number;
  bitcoin: number;
  ethereum: number;
  sp500: number;
  gold: number;
  realEstate: number;
  solana?: number;
  wtiOil: number;
  silver: number;
  nasdaq: number;
  russell2000: number;
  cardano: number;
  polygon: number;
  chainlink: number;
  avalanche?: number;
  ftse100: number;
  nikkei225: number;
  dax: number;
  copper: number;
  naturalGas: number;
  qqq: number;
  vti: number;
}

interface Investment {
  name: string;
  symbol: string;
  color: string;
  icon: React.ReactNode;
  currentReturn: number;
  volatility: number;
  description: string;
  category: 'crypto' | 'traditional' | 'commodities';
}

export default function CryptoComparator() {
  const [selectedPeriod, setSelectedPeriod] = useState<'1y' | '5y' | '10y'>('5y');
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>(['bitcoin', 'ethereum', 'sp500', 'gold', 'cardano', 'chainlink', 'ftse100', 'qqq']);

  const [runTour, setRunTour] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showEvents, setShowEvents] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('tour-completed')) {
      const timer = setTimeout(() => setRunTour(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);


  const performanceData: InvestmentData[] = [
  { 
    year: 2014, 
    bitcoin: 100, ethereum: 100, sp500: 100, gold: 100, realEstate: 100,
    solana: undefined, wtiOil: 100, silver: 100, nasdaq: 100, russell2000: 100,
    cardano: 100, polygon: 100, chainlink: 100, avalanche: undefined,
    ftse100: 100, nikkei225: 100, dax: 100, copper: 100, naturalGas: 100, qqq: 100, vti: 100
  },
  { 
    year: 2015, 
    bitcoin: 135.2, ethereum: 100, sp500: 99.3, gold: 88.4, realEstate: 105.4,
    solana: undefined, wtiOil: 69.5, silver: 86.5, nasdaq: 108.3, russell2000: 94.1,
    cardano: 100, polygon: 100, chainlink: 100, avalanche: undefined,
    ftse100: 100, nikkei225: 100, dax: 100, copper: 100, naturalGas: 100, qqq: 100, vti: 100
  },
  { 
    year: 2016, 
    bitcoin: 304.4, ethereum: 878.5, sp500: 108.7, gold: 96.1, realEstate: 111.4,
    solana: undefined, wtiOil: 100.8, silver: 100.1, nasdaq: 114.7, russell2000: 112.7,
    cardano: 100, polygon: 100, chainlink: 100, avalanche: undefined,
    ftse100: 100, nikkei225: 100, dax: 100, copper: 100, naturalGas: 100, qqq: 100, vti: 100
  },
  { 
    year: 2017, 
    bitcoin: 4451.6, ethereum: 8129.0, sp500: 129.9, gold: 108.2, realEstate: 118.1,
    solana: undefined, wtiOil: 113.4, silver: 105.6, nasdaq: 150.9, russell2000: 127.5,
    cardano: 100, polygon: 100, chainlink: 100, avalanche: undefined,
    ftse100: 100, nikkei225: 100, dax: 100, copper: 100, naturalGas: 100, qqq: 100, vti: 100
  },
  { 
    year: 2018, 
    bitcoin: 1176.4, ethereum: 1429.0, sp500: 121.8, gold: 106.7, realEstate: 123.5,
    solana: undefined, wtiOil: 85.3, silver: 96.9, nasdaq: 149.4, russell2000: 111.9,
    cardano: 100, polygon: 100, chainlink: 100, avalanche: undefined,
    ftse100: 100, nikkei225: 100, dax: 100, copper: 100, naturalGas: 100, qqq: 100, vti: 100
  },
  { 
    year: 2019, 
    bitcoin: 2262.6, ethereum: 1387.1, sp500: 157.0, gold: 127.0, realEstate: 128.3,
    solana: undefined, wtiOil: 114.6, silver: 111.8, nasdaq: 206.0, russell2000: 138.5,
    cardano: 100, polygon: 100, chainlink: 100, avalanche: undefined,
    ftse100: 100, nikkei225: 100, dax: 100, copper: 100, naturalGas: 100, qqq: 100, vti: 100
  },
  { 
    year: 2020, 
    bitcoin: 9119.8, ethereum: 7925.8, sp500: 182.5, gold: 158.3, realEstate: 139.8,
    solana: 100, wtiOil: 91.1, silver: 165.3, nasdaq: 303.8, russell2000: 164.2,
    cardano: 289, polygon: 119, chainlink: 417, avalanche: 100,
    ftse100: 87, nikkei225: 105, dax: 93, copper: 112, naturalGas: 116, qqq: 128, vti: 115
  },
  { 
    year: 2021, 
    bitcoin: 14563.5, ethereum: 39591.4, sp500: 231.5, gold: 150.0, realEstate: 163.3,
    solana: 11289.1, wtiOil: 141.2, silver: 145.9, nasdaq: 391.3, russell2000: 186.0,
    cardano: 2911, polygon: 15812, chainlink: 1151, avalanche: 2534,
    ftse100: 101, nikkei225: 124, dax: 120, copper: 158, naturalGas: 183, qqq: 181, vti: 149
  },
  { 
    year: 2022, 
    bitcoin: 5203.5, ethereum: 12860.2, sp500: 186.5, gold: 152.1, realEstate: 177.7,
    solana: 659.6, wtiOil: 150.7, silver: 150.0, nasdaq: 258.0, russell2000: 145.8,
    cardano: 556, polygon: 4750, chainlink: 312, avalanche: 252,
    ftse100: 102, nikkei225: 112, dax: 105, copper: 137, naturalGas: 264, qqq: 119, vti: 118
  },
  { 
    year: 2023, 
    bitcoin: 13293.4, ethereum: 24494.6, sp500: 231.8, gold: 172.2, realEstate: 187.3,
    solana: 6752.3, wtiOil: 134.5, silver: 149.5, nasdaq: 396.7, russell2000: 167.8,
    cardano: 1333, polygon: 6125, chainlink: 893, avalanche: 924,
    ftse100: 106, nikkei225: 144, dax: 126, copper: 139, naturalGas: 121, qqq: 183, vti: 147
  },
  { 
    year: 2024, 
    bitcoin: 29737.4, ethereum: 46236.6, sp500: 291.6, gold: 279.5, realEstate: 196.4,
    solana: 12653.6, wtiOil: 131.8, silver: 186.1, nasdaq: 493.8, russell2000: 183.8,
    cardano: 733, polygon: 2000, chainlink: 665, avalanche: 502,
    ftse100: 114, nikkei225: 172, dax: 147, copper: 147, naturalGas: 144, qqq: 226, vti: 181
  }
];

  const investments: Investment[] = [
    {
      name: 'Bitcoin',
      symbol: 'bitcoin',
      color: '#F7931A',
      icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png" alt="Bitcoin" width={32} height={32} />,
      currentReturn: 29637.4,
      volatility: 55,
      description: 'The first and most well-known cryptocurrency',
      category: 'crypto'
    },
    {
      name: 'Ethereum',
      symbol: 'ethereum',
      color: '#627EEA',
      icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/langfr-250px-Ethereum-icon-purple.svg.png" alt="Ethereum" width={32} height={32} />,
      currentReturn: 46136.6,
      volatility: 50,
      description: 'Leading smart contract platform',
      category: 'crypto'
    },
    {
      name: 'Solana',
      symbol: 'solana',
      color: '#9945FF',
      icon: <Image src="https://upload.wikimedia.org/wikipedia/fr/f/f2/SolanaLogoMark.png" alt="Solana" width={32} height={32} />,
      currentReturn: 12553.6,
      volatility: 50,
      description: 'High-performance blockchain for DApps',
      category: 'crypto'
    },
    {
      name: 'S&P 500',
      symbol: 'sp500',
      color: '#2563EB',
      icon: <Image src="https://logos.stocktwits-cdn.com/SPX.png" alt="S&P 500" width={32} height={32} />,
      currentReturn: 191.6,
      volatility: 12,
      description: 'Index of the 500 largest US companies',
      category: 'traditional'
    },
    {
      name: 'NASDAQ',
      symbol: 'nasdaq',
      color: '#00D4FF',
      icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/NASDAQ_Logo.svg/2880px-NASDAQ_Logo.svg.png" alt="Nasdaq" width={32} height={32} />,
      currentReturn: 393.8,
      volatility: 16,
      description: 'US technology stock index',
      category: 'traditional'
    },
    {
      name: 'Russell 2000',
      symbol: 'russell2000',
      color: '#FF6B6B',
      icon: <Building2 className="w-8 h-8" />,
      currentReturn: 83.8,
      volatility: 19,
      description: 'US small-cap stock index',
      category: 'traditional'
    },
    {
      name: 'Real Estate',
      symbol: 'realEstate',
      color: '#8B5CF6',
      icon: <Home className="w-8 h-8" />,
      currentReturn: 96.4,
      volatility: 5,
      description: 'Average residential real estate investment',
      category: 'traditional'
    },
    {
      name: 'Gold',
      symbol: 'gold',
      color: '#FFD700',
      icon: <DollarSign className="w-8 h-8" />,
      currentReturn: 179.5,
      volatility: 18,
      description: 'Precious metal, traditional safe haven',
      category: 'commodities'
    },
    {
      name: 'Silver',
      symbol: 'silver',
      color: '#C0C0C0',
      icon: <Shield className="w-8 h-8" />,
      currentReturn: 86.1,
      volatility: 24,
      description: 'Industrial and monetary precious metal',
      category: 'commodities'
    },
    {
      name: 'WTI Oil',
      symbol: 'wtiOil',
      color: '#8B4513',
      icon: <Fuel className="w-8 h-8" />,
      currentReturn: 31.8,
      volatility: 29,
      description: 'West Texas Intermediate crude oil',
      category: 'commodities'
    },
    {
  name: 'Cardano', symbol: 'cardano', color: '#3CC8C8',
  icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Cardano_Logo.jpg" alt="Nasdaq" width={32} height={32} />,
  currentReturn: 633, volatility: 75, description: 'Proof-of-stake blockchain platform', category: 'crypto'
},
{
  name: 'Polygon', symbol: 'polygon', color: '#8247E5',
  icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Polygon_Icon.svg/1280px-Polygon_Icon.svg.png" alt="Nasdaq" width={32} height={32} />,
  currentReturn: 1900, volatility: 80, description: 'Ethereum scaling and infrastructure', category: 'crypto'
},
{
  name: 'Chainlink', symbol: 'chainlink', color: '#375BD2',
  icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Chainlink_Logo_Blue.svg/2880px-Chainlink_Logo_Blue.svg.png" alt="Nasdaq" width={32} height={32} />,
  currentReturn: 565, volatility: 65, description: 'Decentralized oracle network', category: 'crypto'
},
{
  name: 'Avalanche', symbol: 'avalanche', color: '#E84142',
  icon: <Image src="https://upload.wikimedia.org/wikipedia/fr/thumb/7/78/Avalanche_AVAX_Logo.png/1280px-Avalanche_AVAX_Logo.png" alt="Nasdaq" width={32} height={32} />,
  currentReturn: 402, volatility: 70, description: 'High-performance blockchain platform', category: 'crypto'
},
{
  name: 'FTSE 100', symbol: 'ftse100', color: '#C41E3A',
  icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/FTSE_100_logo.svg/1024px-FTSE_100_logo.svg.png" alt="Nasdaq" width={32} height={32} />,
  currentReturn: 14, volatility: 14, description: 'UK stock market index', category: 'traditional'
},
{
  name: 'Nikkei 225', symbol: 'nikkei225', color: '#DC143C',
  icon: <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">JP</div>,
  currentReturn: 72, volatility: 16, description: 'Japan stock market index', category: 'traditional'
},
{
  name: 'DAX', symbol: 'dax', color: '#FFCC00',
  icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/DAX-logo.svg/2880px-DAX-logo.svg.png" alt="Nasdaq" width={32} height={32} />,
  currentReturn: 47, volatility: 18, description: 'German stock market index', category: 'traditional'
},
{
  name: 'QQQ ETF', symbol: 'qqq', color: '#00BFFF',
  icon: <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-xs">QQQ</div>,
  currentReturn: 126, volatility: 22, description: 'NASDAQ-100 tracking ETF', category: 'traditional'
},
{
  name: 'VTI ETF', symbol: 'vti', color: '#228B22',
  icon: <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-xs">VTI</div>,
  currentReturn: 81, volatility: 15, description: 'Total US stock market ETF', category: 'traditional'
},
{
  name: 'Copper', symbol: 'copper', color: '#B87333',
  icon: <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xs">Cu</div>,
  currentReturn: 47, volatility: 25, description: 'Industrial metal commodity', category: 'commodities'
},
{
  name: 'Natural Gas', symbol: 'naturalGas', color: '#4169E1',
  icon: <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xs">NG</div>,
  currentReturn: 44, volatility: 45, description: 'Natural gas commodity', category: 'commodities'
}
  ];

  const getFilteredData = () => {
    const currentYear = 2024;
    const yearsBack = selectedPeriod === '1y' ? 1 : selectedPeriod === '5y' ? 5 : 10;
    return performanceData.filter(data => data.year >= currentYear - yearsBack);
  };

  const calculateFinalValue = (investment: string) => {
  const data = getFilteredData();
  if (data.length === 0) return initialInvestment;
  
  let firstValue: number;
  let lastValue: number;

  if (investment === 'solana') {
    const solanaData = data.filter(d => d.solana !== undefined);
    if (solanaData.length === 0) return initialInvestment;
    firstValue = solanaData[0].solana!;
    lastValue = solanaData[solanaData.length - 1].solana!;
  } else if (investment === 'avalanche') {
    const avalancheData = data.filter(d => d.avalanche !== undefined);
    if (avalancheData.length === 0) return initialInvestment;
    firstValue = avalancheData[0].avalanche!;
    lastValue = avalancheData[avalancheData.length - 1].avalanche!;
  } else {
    firstValue = data[0][investment as keyof InvestmentData] as number;
    lastValue = data[data.length - 1][investment as keyof InvestmentData] as number;
  }

  return Math.round((initialInvestment * lastValue) / firstValue);
};

  const toggleInvestment = (symbol: string) => {
    setSelectedInvestments(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const calculatePeriodReturn = (assetKey: string): string => {
    const currentYear = 2024;
    const startYear = selectedPeriod === '1y' ? 2023 : selectedPeriod === '5y' ? 2019 : 2014;
    const startData = performanceData.find(d => d.year === startYear);
    const endData = performanceData.find(d => d.year === currentYear);
    if (!startData || !endData) return 'N/A';
    const startValue = startData[assetKey as keyof InvestmentData];
    const endValue = endData[assetKey as keyof InvestmentData];
    if (typeof startValue !== 'number' || typeof endValue !== 'number' || startValue === 0) return 'N/A';
    const ret = ((endValue - startValue) / startValue) * 100;
    return ret >= 0 ? `+${ret.toFixed(0)}%` : `${ret.toFixed(0)}%`;
  };

  const getPeriodReturnColor = (assetKey: string): string => {
    const text = calculatePeriodReturn(assetKey);
    if (text === 'N/A' || text.startsWith('-')) return 'text-red-400';
    return 'text-green-400';
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const chartElement = document.querySelector('#tour-chart .recharts-wrapper') as HTMLElement | null;
      const periodLabel = selectedPeriod === '1y' ? '1 Year' : selectedPeriod === '5y' ? '5 Years' : '10 Years';

      const assetMetrics = selectedInvestments.map(symbol => {
        const inv = investments.find(i => i.symbol === symbol);
        const finalValue = calculateFinalValue(symbol);
        const profit = finalValue - initialInvestment;
        const returnPct = ((finalValue - initialInvestment) / initialInvestment) * 100;
        return {
          name: inv?.name || symbol,
          symbol,
          finalValue,
          profit,
          returnPct,
          volatility: inv?.volatility || 0,
          category: inv?.category || 'traditional',
        };
      });

      await generatePDF({
        assets: assetMetrics,
        period: periodLabel,
        investment: initialInvestment,
        chartElement,
        generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <GuidedTour run={runTour} onFinish={() => setRunTour(false)} />
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} onStartTour={() => { localStorage.removeItem('tour-completed'); setRunTour(true); }} />
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Complete Investment Comparator
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:inline">Compare all assets with real historical data</span>
              <button
                onClick={() => { localStorage.removeItem('tour-completed'); setRunTour(true); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
              >
                Take Tour
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white text-sm font-bold transition-colors flex items-center justify-center"
                aria-label="Help"
              >
                ?
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
  <h2 className="text-2xl font-bold mb-4 text-center">20 Assets, Thousands of Possibilities</h2>
  <p className="text-center text-gray-300 mb-6">
    Compare the performance of cryptocurrencies, international indices, ETFs and commodities over 5 years of real historical data.
  </p>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="text-center">
      <div className="bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
        <Coins className="w-6 h-6 text-blue-400" />
      </div>
      <h3 className="font-semibold mb-2">7 Cryptocurrencies</h3>
<p className="text-sm text-gray-300">Bitcoin, Ethereum, Solana, Cardano, Polygon, Chainlink, Avalanche</p>
    </div>
    <div className="text-center">
      <div className="bg-emerald-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
        <Activity className="w-6 h-6 text-emerald-400" />
      </div>
      <h3 className="font-semibold mb-2">9 Stock Indices & ETFs</h3>
      <p className="text-sm text-gray-300">US, UK, Japan, Germany markets + Real Estate</p>
    </div>
    <div className="text-center">
      <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
        <Shield className="w-6 h-6 text-purple-400" />
      </div>
      <h3 className="font-semibold mb-2">5 Commodities</h3>
      <p className="text-sm text-gray-300">Gold, Silver, Oil, Copper, Natural Gas</p>
    </div>
  </div>
</div>
        <div id="tour-controls" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div id="tour-investment" className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <InfoTip text="The starting amount you would have invested. All returns are calculated based on this initial sum.">Initial Investment Amount</InfoTip>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10000"
              />
            </div>
          </div>
          <div id="tour-period" className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <InfoTip text="Choose the timeframe for comparison: 1 year, 5 years, or 10 years of historical data.">Analysis Period</InfoTip>
            </label>
            <div className="flex gap-2">
              {(['1y', '5y', '10y'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {period === '1y' ? '1 Year' : period === '5y' ? '5 Years' : '10 Years'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div id="tour-assets" className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-bold mb-6">Select Investments to Compare</h3>
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              ● Cryptocurrency
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => toggleInvestment('bitcoin')}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                  selectedInvestments.includes('bitcoin')
                    ? 'bg-white/15 border-white/30 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png" alt="Bitcoin" width={32} height={32} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-lg">Bitcoin</div>
                  <div className={`${getPeriodReturnColor('bitcoin')} font-medium`}>{calculatePeriodReturn('bitcoin')}</div>
                  <div className="text-gray-400 text-sm">Vol: 55%</div>
                </div>
              </button>
              <button
                onClick={() => toggleInvestment('ethereum')}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                  selectedInvestments.includes('ethereum')
                    ? 'bg-white/15 border-white/30 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/langfr-250px-Ethereum-icon-purple.svg.png" alt="Ethereum" width={32} height={32} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-lg">Ethereum</div>
                  <div className={`${getPeriodReturnColor('ethereum')} font-medium`}>{calculatePeriodReturn('ethereum')}</div>
                  <div className="text-gray-400 text-sm">Vol: 50%</div>
                </div>
              </button>
              <button
                onClick={() => toggleInvestment('solana')}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                  selectedInvestments.includes('solana')
                    ? 'bg-white/15 border-white/30 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Image src="https://upload.wikimedia.org/wikipedia/fr/f/f2/SolanaLogoMark.png" alt="Solana" width={32} height={32} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-lg">Solana</div>
                  <div className={`${getPeriodReturnColor('solana')} font-medium`}>{calculatePeriodReturn('solana')}</div>
                  <div className="text-gray-400 text-sm">Vol: 50%</div>
                </div>
              </button>
    <button
      onClick={() => toggleInvestment('cardano')}
      className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
        selectedInvestments.includes('cardano')
          ? 'bg-white/15 border-white/30 shadow-lg scale-105'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="w-12 h-12 bg-black-600 rounded-full flex items-center justify-center">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Cardano_Logo.jpg" alt="Ethereum" width={32} height={32} />
                </div>
      <div className="text-center">
        <div className="font-bold text-white text-lg">Cardano</div>
        <div className={`${getPeriodReturnColor('cardano')} font-medium`}>{calculatePeriodReturn('cardano')}</div>
        <div className="text-gray-400 text-sm">Vol: 75%</div>
      </div>
    </button>

    <button
      onClick={() => toggleInvestment('polygon')}
      className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
        selectedInvestments.includes('polygon')
          ? 'bg-white/15 border-white/30 shadow-lg scale-105'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="w-12 h-12 bg-purple-750 rounded-full flex items-center justify-center">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Polygon_Icon.svg/1280px-Polygon_Icon.svg.png" alt="Ethereum" width={32} height={32} />
                </div>
      <div className="text-center">
        <div className="font-bold text-white text-lg">Polygon</div>
        <div className={`${getPeriodReturnColor('polygon')} font-medium`}>{calculatePeriodReturn('polygon')}</div>
        <div className="text-gray-400 text-sm">Vol: 80%</div>
      </div>
    </button>

    <button
      onClick={() => toggleInvestment('chainlink')}
      className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
        selectedInvestments.includes('chainlink')
          ? 'bg-white/15 border-white/30 shadow-lg scale-105'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="w-12 h-12 bg-white-650 rounded-full flex items-center justify-center">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/d/dd/Chainlink_Logo.png" alt="Ethereum" width={32} height={32} />
                </div>
      <div className="text-center">
        <div className="font-bold text-white text-lg">Chainlink</div>
        <div className={`${getPeriodReturnColor('chainlink')} font-medium`}>{calculatePeriodReturn('chainlink')}</div>
        <div className="text-gray-400 text-sm">Vol: 65%</div>
      </div>
    </button>

    <button
      onClick={() => toggleInvestment('avalanche')}
      className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
        selectedInvestments.includes('avalanche')
          ? 'bg-white/15 border-white/30 shadow-lg scale-105'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="w-12 h-12 bg-orange-650 rounded-full flex items-center justify-center">
                  <Image src="https://upload.wikimedia.org/wikipedia/fr/thumb/7/78/Avalanche_AVAX_Logo.png/1280px-Avalanche_AVAX_Logo.png" alt="Bitcoin" width={32} height={32} />
                </div>
      <div className="text-center">
        <div className="font-bold text-white text-lg">Avalanche</div>
        <div className={`${getPeriodReturnColor('avalanche')} font-medium`}>{calculatePeriodReturn('avalanche')}</div>
        <div className="text-gray-400 text-sm">Vol: 70%</div>
      </div>
    </button>
  </div>
</div>
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              ● Traditional Assets
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => toggleInvestment('sp500')}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                  selectedInvestments.includes('sp500')
                    ? 'bg-white/15 border-white/30 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  S&P
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-lg">S&P 500</div>
                  <div className={`${getPeriodReturnColor('sp500')} font-medium`}>{calculatePeriodReturn('sp500')}</div>
                  <div className="text-gray-400 text-sm">Vol: 12%</div>
                </div>
              </button>
              <button
                onClick={() => toggleInvestment('nasdaq')}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                  selectedInvestments.includes('nasdaq')
                    ? 'bg-white/15 border-white/30 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/NASDAQ_Logo.svg/2880px-NASDAQ_Logo.svg.png" alt="NASDAQ" width={32} height={32} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-lg">NASDAQ</div>
                  <div className={`${getPeriodReturnColor('nasdaq')} font-medium`}>{calculatePeriodReturn('nasdaq')}</div>
                  <div className="text-gray-400 text-sm">Vol: 16%</div>
                </div>
              </button>
              <button
                onClick={() => toggleInvestment('russell2000')}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                  selectedInvestments.includes('russell2000')
                    ? 'bg-white/15 border-white/30 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  IWM
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-lg">Russell 2000</div>
                  <div className={`${getPeriodReturnColor('russell2000')} font-medium`}>{calculatePeriodReturn('russell2000')}</div>
                  <div className="text-gray-400 text-sm">Vol: 19%</div>
                </div>
              </button>
    <button
      onClick={() => toggleInvestment('ftse100')}
      className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
        selectedInvestments.includes('ftse100')
          ? 'bg-white/15 border-white/30 shadow-lg scale-105'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/FTSE_Logo.svg/1200px-FTSE_Logo.svg.png" alt="NASDAQ" width={32} height={32} />
                </div>
      <div className="text-center">
        <div className="font-bold text-white text-lg">FTSE 100</div>
        <div className={`${getPeriodReturnColor('ftse100')} font-medium`}>{calculatePeriodReturn('ftse100')}</div>
        <div className="text-gray-400 text-sm">Vol: 14%</div>
      </div>
    </button>

    <button
      onClick={() => toggleInvestment('nikkei225')}
      className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
        selectedInvestments.includes('nikkei225')
          ? 'bg-white/15 border-white/30 shadow-lg scale-105'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
        JP
      </div>
      <div className="text-center">
        <div className="font-bold text-white text-lg">Nikkei 225</div>
        <div className={`${getPeriodReturnColor('nikkei225')} font-medium`}>{calculatePeriodReturn('nikkei225')}</div>
        <div className="text-gray-400 text-sm">Vol: 16%</div>
      </div>
    </button>

    <button
      onClick={() => toggleInvestment('dax')}
      className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
        selectedInvestments.includes('dax')
          ? 'bg-white/15 border-white/30 shadow-lg scale-105'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/DAX-logo.svg/2880px-DAX-logo.svg.png" alt="NASDAQ" width={32} height={32} />
                </div>
      <div className="text-center">
        <div className="font-bold text-white text-lg">DAX</div>
        <div className={`${getPeriodReturnColor('dax')} font-medium`}>{calculatePeriodReturn('dax')}</div>
        <div className="text-gray-400 text-sm">Vol: 18%</div>
      </div>
    </button>
    <button
      onClick={() => toggleInvestment('qqq')}
      className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
        selectedInvestments.includes('qqq')
          ? 'bg-white/15 border-white/30 shadow-lg scale-105'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
        QQQ
      </div>
      <div className="text-center">
        <div className="font-bold text-white text-lg">QQQ ETF</div>
        <div className={`${getPeriodReturnColor('qqq')} font-medium`}>{calculatePeriodReturn('qqq')}</div>
        <div className="text-gray-400 text-sm">Vol: 22%</div>
      </div>
    </button>

    <button
      onClick={() => toggleInvestment('vti')}
      className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
        selectedInvestments.includes('vti')
          ? 'bg-white/15 border-white/30 shadow-lg scale-105'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
        VTI
      </div>
      <div className="text-center">
        <div className="font-bold text-white text-lg">VTI ETF</div>
        <div className={`${getPeriodReturnColor('vti')} font-medium`}>{calculatePeriodReturn('vti')}</div>
        <div className="text-gray-400 text-sm">Vol: 15%</div>
      </div>
    </button>
            </div>
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
              ● Commodities & Real Assets
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => toggleInvestment('gold')}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                  selectedInvestments.includes('gold')
                    ? 'bg-white/15 border-white/30 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-lg">Gold</div>
                  <div className={`${getPeriodReturnColor('gold')} font-medium`}>{calculatePeriodReturn('gold')}</div>
                  <div className="text-gray-400 text-sm">Vol: 18%</div>
                </div>
              </button>
              <button
                onClick={() => toggleInvestment('realEstate')}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                  selectedInvestments.includes('realEstate')
                    ? 'bg-white/15 border-white/30 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-lg">Real Estate</div>
                  <div className={`${getPeriodReturnColor('realEstate')} font-medium`}>{calculatePeriodReturn('realEstate')}</div>
                  <div className="text-gray-400 text-sm">Vol: 5%</div>
                </div>
              </button>
              <button
                onClick={() => toggleInvestment('wtiOil')}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                  selectedInvestments.includes('wtiOil')
                    ? 'bg-white/15 border-white/30 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  OIL
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-lg">WTI Oil</div>
                  <div className={`${getPeriodReturnColor('wtiOil')} font-medium`}>{calculatePeriodReturn('wtiOil')}</div>
                  <div className="text-gray-400 text-sm">Vol: 29%</div>
                </div>
              </button>
              <button
                onClick={() => toggleInvestment('silver')}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                  selectedInvestments.includes('silver')
                    ? 'bg-white/15 border-white/30 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  AG
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-lg">Silver</div>
                  <div className={`${getPeriodReturnColor('silver')} font-medium`}>{calculatePeriodReturn('silver')}</div>
                  <div className="text-gray-400 text-sm">Vol: 24%</div>
                </div>
              </button>
    <button
      onClick={() => toggleInvestment('copper')}
      className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
        selectedInvestments.includes('copper')
          ? 'bg-white/15 border-white/30 shadow-lg scale-105'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
        Cu
      </div>
      <div className="text-center">
        <div className="font-bold text-white text-lg">Copper</div>
        <div className={`${getPeriodReturnColor('copper')} font-medium`}>{calculatePeriodReturn('copper')}</div>
        <div className="text-gray-400 text-sm">Vol: 25%</div>
      </div>
    </button>

    <button
      onClick={() => toggleInvestment('naturalGas')}
      className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-3 ${
        selectedInvestments.includes('naturalGas')
          ? 'bg-white/15 border-white/30 shadow-lg scale-105'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
        NG
      </div>
      <div className="text-center">
        <div className="font-bold text-white text-lg">Natural Gas</div>
        <div className={`${getPeriodReturnColor('naturalGas')} font-medium`}>{calculatePeriodReturn('naturalGas')}</div>
        <div className="text-gray-400 text-sm">Vol: 45%</div>
      </div>
    </button>
            </div>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
            <span className="text-blue-400 font-medium">
              {selectedInvestments.length} assets selected for comparison
            </span>
            <button
              onClick={() => setSelectedInvestments(['bitcoin', 'ethereum', 'sp500', 'gold', 'solana', 'nasdaq'])}
              className="text-blue-400 hover:text-blue-300 underline font-medium"
            >
              Reset to Default
            </button>
          </div>
        </div>
        <div id="tour-chart" className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-bold mb-4"><InfoTip text="All assets start at base 100 for fair comparison. A value of 300 means the asset tripled in value.">Performance Evolution</InfoTip></h3>
          <div className="flex items-center gap-2 mt-2 mb-2">
            <button
              onClick={() => setShowEvents(v => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                showEvents
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                  : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
              }`}
              aria-pressed={showEvents}
              aria-label="Toggle historical event markers on chart"
            >
              <Activity className="w-4 h-4" />
              Historical Events
            </button>
          </div>
          <div className="h-96 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getFilteredData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                {selectedInvestments.map((investment) => {
                  const investmentData = investments.find(i => i.symbol === investment);
                  return (
                    <Line
                      key={investment}
                      type="monotone"
                      dataKey={investment}
                      stroke={investmentData?.color}
                      strokeWidth={2}
                      name={investmentData?.name}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
            <HistoricalEvents selectedPeriod={selectedPeriod} visible={showEvents} />
          </div>
        </div>
        <div id="tour-results" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {selectedInvestments.slice(0, 9).map((investmentSymbol) => {
            const investment = investments.find(i => i.symbol === investmentSymbol);
            if (!investment) return null;
            
            const finalValue = calculateFinalValue(investmentSymbol);
            const profit = finalValue - initialInvestment;
            const profitPercentage = ((finalValue - initialInvestment) / initialInvestment) * 100;

            return (
              <div
                key={investmentSymbol}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                style={{ borderColor: `${investment.color}30` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10">
                    {investment.icon}
                  </div>
                  <div>
                    <h3 className="font-bold">{investment.name}</h3>
                    <span className="text-xs text-gray-400 capitalize">{investment.category}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Final Value</p>
                    <p className="text-2xl font-bold text-white">${finalValue.toLocaleString()}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Profit</p>
                      <p className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${profit.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400"><InfoTip text="Total profit or loss as a percentage of your initial investment.">Return</InfoTip></p>
                      <p className={`font-bold ${profitPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400"><InfoTip text="Measures how much the price fluctuates. Higher volatility means more risk but also more potential reward.">Volatility</InfoTip></p>
                      <p className="text-sm text-white">{investment.volatility}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Risk</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        investment.volatility < 10 ? 'bg-green-500/20 text-green-300' :
                        investment.volatility < 25 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {investment.volatility < 10 ? 'Low' :
                         investment.volatility < 25 ? 'Medium' : 'High'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div id="tour-table" className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-bold mb-4">Detailed Comparison Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4">Asset</th>
                  <th className="text-right py-3 px-4"><InfoTip text="Total profit or loss over the selected period, as a percentage.">Return {selectedPeriod}</InfoTip></th>
                  <th className="text-right py-3 px-4"><InfoTip text="How much the price swings. Higher % = riskier asset.">Volatility</InfoTip></th>
                  <th className="text-right py-3 px-4">Final Value</th>
                  <th className="text-right py-3 px-4">Category</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvestments.map((investmentSymbol) => {
                  const investment = investments.find(i => i.symbol === investmentSymbol);
                  if (!investment) return null;

                  const finalValue = calculateFinalValue(investmentSymbol);
                  const profitPercentage = ((finalValue - initialInvestment) / initialInvestment) * 100;

                  return (
                    <tr key={investmentSymbol} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 flex items-center justify-center">
                            {investment.icon}
                          </div>
                          <span className="font-medium">{investment.name}</span>
                        </div>
                      </td>
                      <td className={`text-right py-3 px-4 font-bold ${
                        profitPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
                      </td>
                      <td className="text-right py-3 px-4 text-gray-300">
                        {investment.volatility}%
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        ${finalValue.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          investment.category === 'crypto' ? 'bg-orange-500/20 text-orange-300' :
                          investment.category === 'traditional' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {investment.category === 'crypto' ? 'Crypto' :
                           investment.category === 'traditional' ? 'Stocks' : 'Commodities'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30">
            <h4 className="text-xl font-bold mb-4 text-orange-400">Cryptocurrencies (7)</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Top performer:</span>
                <span className="text-sm font-bold text-white">Ethereum (+46,137%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Average volatility:</span>
                <span className="text-sm font-bold text-red-300">~70%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">New additions:</span>
                <span className="text-sm font-bold text-emerald-300">Cardano, Polygon, Chainlink, Avalanche</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-green-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
            <h4 className="text-xl font-bold mb-4 text-blue-400">Global Markets (9)</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Top performer:</span>
                <span className="text-sm font-bold text-white">NASDAQ (+394%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Global coverage:</span>
                <span className="text-sm font-bold text-emerald-300">US, UK, Japan, Germany</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Best international:</span>
                <span className="text-sm font-bold text-blue-300">Nikkei 225 (+72%)</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <h4 className="text-xl font-bold mb-4 text-purple-400">Commodities (5)</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Top performer:</span>
                <span className="text-sm font-bold text-white">Gold (+180%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Industrial metals:</span>
                <span className="text-sm font-bold text-emerald-300">Copper (+47%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Energy:</span>
                <span className="text-sm font-bold text-blue-300">Natural Gas (+44%)</span>
              </div>
            </div>
          </div>
        </div>
        <div id="tour-explore" className="bg-gradient-to-r from-blue-500/20 to-green-500/20 backdrop-blur-sm rounded-xl p-8 border border-blue-500/30 text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-500/20 rounded-full p-3">
              <Calculator className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold">Try Dollar Cost Averaging</h3>
          </div>
          <p className="text-gray-300 mb-6 max-w-3xl mx-auto">
            See how regular monthly investments would have performed with our DCA calculator. 
            Compare the power of consistent investing across all 10 assets with real historical data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-500/10 rounded-lg p-4">
              <div className="text-2xl mb-2">📅</div>
              <h4 className="font-bold text-green-400 mb-2">Monthly Investing</h4>
              <p className="text-sm text-gray-300">Set it and forget it strategy</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-4">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-bold text-blue-400 mb-2">Real Results</h4>
              <p className="text-sm text-gray-300">Based on actual historical prices</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-4">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-bold text-purple-400 mb-2">Compare All Assets</h4>
              <p className="text-sm text-gray-300">Bitcoin, stocks, gold, and more</p>
            </div>
          </div>
          <Link 
            href="/dca-calculator"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <Calculator className="w-5 h-5" />
            Calculate DCA Returns
          </Link>
        </div>
<div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-8 border border-red-500/30 text-center mb-8">
  <div className="flex items-center justify-center gap-3 mb-4">
    <div className="bg-red-500/20 rounded-full p-3">
      <AlertTriangle className="w-8 h-8 text-red-400" />
    </div>
    <h3 className="text-2xl font-bold">Professional Risk Analysis</h3>
  </div>
  <p className="text-gray-300 mb-6 max-w-3xl mx-auto">
    Analyze your investments with institutional-grade risk metrics. Calculate Sharpe ratios, 
    max drawdowns, correlations, and more to make informed decisions like the pros.
  </p>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-red-500/10 rounded-lg p-4">
      <div className="text-2xl mb-2">📊</div>
      <h4 className="font-bold text-red-400 mb-2">Advanced Metrics</h4>
      <p className="text-sm text-gray-300">Sharpe, Sortino, VaR, Beta & more</p>
    </div>
    <div className="bg-orange-500/10 rounded-lg p-4">
      <div className="text-2xl mb-2">🎯</div>
      <h4 className="font-bold text-orange-400 mb-2">Risk Assessment</h4>
      <p className="text-sm text-gray-300">Understand volatility and drawdowns</p>
    </div>
    <div className="bg-yellow-500/10 rounded-lg p-4">
      <div className="text-2xl mb-2">🔄</div>
      <h4 className="font-bold text-yellow-400 mb-2">Correlation Matrix</h4>
      <p className="text-sm text-gray-300">Optimize portfolio diversification</p>
    </div>
  </div>
  <Link 
    href="/risk-analysis"
    className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
  >
    <AlertTriangle className="w-5 h-5" />
    Analyze Investment Risk
  </Link>
</div>

        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-8 border border-indigo-500/30 text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-indigo-500/20 rounded-full p-3">
              <Building2 className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold">Portfolio Optimizer</h3>
          </div>
          <p className="text-gray-300 mb-6 max-w-3xl mx-auto">
            Build and optimize your investment portfolio with Markowitz Modern Portfolio Theory.
            Visualize the efficient frontier and find the optimal risk-return balance for your goals.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-500/10 rounded-lg p-4">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-bold text-indigo-400 mb-2">Optimal Weights</h4>
              <p className="text-sm text-gray-300">Find the best asset allocation</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-4">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-bold text-purple-400 mb-2">Efficient Frontier</h4>
              <p className="text-sm text-gray-300">Visualize optimal risk-return tradeoffs</p>
            </div>
            <div className="bg-violet-500/10 rounded-lg p-4">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-bold text-violet-400 mb-2">Max Sharpe</h4>
              <p className="text-sm text-gray-300">Maximize return per unit of risk</p>
            </div>
          </div>
          <Link
            href="/portfolio-optimizer"
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <Building2 className="w-5 h-5" />
            Launch Portfolio Optimizer
          </Link>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-8 border border-purple-500/30 text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-purple-500/20 rounded-full p-3">
              <Play className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold">Asset Evolution Timeline</h3>
          </div>
          <p className="text-gray-300 mb-6 max-w-3xl mx-auto">
            Watch how 21 assets evolved over a decade in an animated Hans Rosling-style bubble chart.
            See risk vs return dynamics unfold year by year from 2014 to 2024.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-500/10 rounded-lg p-4">
              <div className="text-2xl mb-2">🫧</div>
              <h4 className="font-bold text-purple-400 mb-2">Animated Bubbles</h4>
              <p className="text-sm text-gray-300">Size = return magnitude, position = risk/reward</p>
            </div>
            <div className="bg-pink-500/10 rounded-lg p-4">
              <div className="text-2xl mb-2">⏱️</div>
              <h4 className="font-bold text-pink-400 mb-2">Year-by-Year</h4>
              <p className="text-sm text-gray-300">Play, pause, scrub through 11 years of data</p>
            </div>
            <div className="bg-fuchsia-500/10 rounded-lg p-4">
              <div className="text-2xl mb-2">🛤️</div>
              <h4 className="font-bold text-fuchsia-400 mb-2">Trail Tracking</h4>
              <p className="text-sm text-gray-300">Click any asset to trace its path over time</p>
            </div>
          </div>
          <Link
            href="/asset-evolution"
            className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <Play className="w-5 h-5" />
            Watch Asset Evolution
          </Link>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-8 border border-cyan-500/30 text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-cyan-500/20 rounded-full p-3">
              <Bot className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold">Educational Assistant</h3>
          </div>
          <p className="text-gray-300 mb-6 max-w-3xl mx-auto">
            Not sure what a Sharpe Ratio is? Confused by the efficient frontier? Ask our AI-powered
            assistant to explain any financial concept in simple terms.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-cyan-500/10 rounded-lg p-4">
              <div className="text-2xl mb-2">💬</div>
              <h4 className="font-bold text-cyan-400 mb-2">Ask Anything</h4>
              <p className="text-sm text-gray-300">Financial concepts explained simply</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-4">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-bold text-blue-400 mb-2">Learn by Doing</h4>
              <p className="text-sm text-gray-300">Understand the data you see on the platform</p>
            </div>
            <div className="bg-indigo-500/10 rounded-lg p-4">
              <div className="text-2xl mb-2">🤖</div>
              <h4 className="font-bold text-indigo-400 mb-2">AI-Powered</h4>
              <p className="text-sm text-gray-300">Powered by Claude for accurate explanations</p>
            </div>
          </div>
          <Link
            href="/assistant"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <Bot className="w-5 h-5" />
            Chat with Assistant
          </Link>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            className="inline-flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium py-2.5 px-6 rounded-lg border border-blue-500/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF Report
              </>
            )}
          </button>
        </div>

        <div className="text-center text-xs text-gray-500 pt-6 border-t border-white/10">
          <p>
            COM-480 Data Visualization — Milestone 2 prototype. Data normalized
            to base 100 at each asset&apos;s launch year. Additional features
            (advanced risk metrics, correlations, scatter plots) are coming in
            the final version.
          </p>
        </div>
      </div>
    </div>
  );
}