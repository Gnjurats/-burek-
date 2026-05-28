'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Shield, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import InfoTip from '../../components/Tooltip';
import { calculateAdvancedMetrics, type AdvancedMetrics } from '../../lib/advancedMetrics';
import { useComparator } from '../../context/ComparatorContext';

const CorrelationMatrix = dynamic(() => import('../../components/CorrelationMatrix'), { ssr: false });
const RiskReturnScatter = dynamic(() => import('../../components/RiskReturnScatter'), { ssr: false });
const VolatilityHeatmap = dynamic(() => import('../../components/VolatilityHeatmap'), { ssr: false });

interface MonthlyReturns {
  bitcoin: number;
  ethereum: number;
  solana: number | null;
  sp500: number;
  nasdaq: number;
  russell2000: number;
  realEstate: number;
  gold: number;
  silver: number;
  wtiOil: number;
  riskFree: number;
}


interface Investment {
  name: string;
  symbol: string;
  color: string;
  icon: React.ReactNode;
  category: 'crypto' | 'traditional' | 'commodities';
}

export default function RiskAnalysis() {
  const { selectedAssets, setSelectedAssets } = useComparator();
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);

  const monthlyReturnsData: Record<string, MonthlyReturns> = {
    "2020-01": { bitcoin: 30.05, ethereum: 40.31, solana: null, sp500: -0.18, nasdaq: 1.98, russell2000: -0.69, realEstate: 0.6, gold: 4.61, silver: 0.34, wtiOil: -5.8, riskFree: 1.52 },
    "2020-02": { bitcoin: -8.13, ethereum: 23.2, solana: null, sp500: -8.41, nasdaq: -6.3, russell2000: -9.05, realEstate: 0.47, gold: -0.13, silver: -6.87, wtiOil: -22.02, riskFree: 1.53 },
    "2020-03": { bitcoin: -25.13, ethereum: -40.36, solana: null, sp500: -12.49, nasdaq: -10.12, russell2000: -23.46, realEstate: 0.93, gold: 0.38, silver: -16.31, wtiOil: -54.18, riskFree: 0.38 },
    "2020-04": { bitcoin: 34.23, ethereum: 55.64, solana: null, sp500: 12.68, nasdaq: 15.45, russell2000: 9.1, realEstate: 0.46, gold: 7.73, silver: 7.74, wtiOil: -197.95, riskFree: 0.12 },
    "2020-05": { bitcoin: 9.53, ethereum: 11.59, solana: -20.51, sp500: 4.53, nasdaq: 6.82, russell2000: 7.71, realEstate: 0.92, gold: 1.28, silver: 17.15, wtiOil: -175.92, riskFree: 0.13 },
    "2020-06": { bitcoin: -3.4, ethereum: -2.6, solana: 112.9, sp500: 1.84, nasdaq: 5.99, russell2000: 6.35, realEstate: 0.46, gold: 2.6, silver: 1.42, wtiOil: 34.16, riskFree: 0.16 },
    "2020-07": { bitcoin: 24.13, ethereum: 53.33, solana: 33.33, sp500: 5.51, nasdaq: 6.82, russell2000: 3.4, realEstate: 0.91, gold: 10.86, silver: 36.65, wtiOil: 6.93, riskFree: 0.12 },
    "2020-08": { bitcoin: 2.85, ethereum: 25.8, solana: 68.75, sp500: 7.01, nasdaq: 9.59, russell2000: 5.63, realEstate: 0.9, gold: -0.3, silver: 12.2, wtiOil: 4.1, riskFree: 0.11 },
    "2020-09": { bitcoin: -7.59, ethereum: -17.05, solana: -0.34, sp500: -3.92, nasdaq: -6.82, russell2000: -4.31, realEstate: 1.34, gold: -4.25, silver: -13.69, wtiOil: -5.59, riskFree: 0.11 },
    "2020-10": { bitcoin: 27.92, ethereum: 6.11, solana: -53.04, sp500: -2.77, nasdaq: -2.29, russell2000: 7.22, realEstate: 0.88, gold: -0.37, silver: -1.39, wtiOil: -11.01, riskFree: 0.11 },
    "2020-11": { bitcoin: 42.81, ethereum: 61.26, solana: 37.41, sp500: 10.75, nasdaq: 11.8, russell2000: 12.7, realEstate: 1.31, gold: -5.57, silver: -2.87, wtiOil: 26.71, riskFree: 0.09 },
    "2020-12": { bitcoin: 47.27, ethereum: 19.64, solana: -20.94, sp500: 3.71, nasdaq: 5.65, russell2000: 8.47, realEstate: 0.86, gold: 6.8, silver: 16.56, wtiOil: 7.02, riskFree: 0.08 },
    "2021-01": { bitcoin: 14.21, ethereum: 77.81, solana: 148.34, sp500: -1.11, nasdaq: 1.42, russell2000: 5.89, realEstate: 0.85, gold: -2.49, silver: 1.92, wtiOil: 7.58, riskFree: 0.08 },
    "2021-02": { bitcoin: 36.31, ethereum: 8.04, solana: 295.73, sp500: 2.61, nasdaq: 0.93, russell2000: 5.2, realEstate: 1.27, gold: -6.56, silver: -1.0, wtiOil: 18.2, riskFree: 0.06 },
    "2021-03": { bitcoin: 30.5, ethereum: 35.33, solana: 26.43, sp500: 4.24, nasdaq: 0.41, russell2000: 0.82, realEstate: 1.26, gold: -0.81, silver: -7.66, wtiOil: -4.0, riskFree: 0.03 },
    "2021-04": { bitcoin: -1.95, ethereum: 44.68, solana: 133.48, sp500: 5.24, nasdaq: 5.4, russell2000: 1.53, realEstate: 0.83, gold: 3.21, silver: 5.77, wtiOil: 7.48, riskFree: 0.02 },
    "2021-05": { bitcoin: -35.4, ethereum: -2.3, solana: -20.44, sp500: 0.55, nasdaq: -1.53, russell2000: 0.53, realEstate: 1.23, gold: 7.7, silver: 7.42, wtiOil: 4.32, riskFree: 0.01 },
    "2021-06": { bitcoin: -6.05, ethereum: -16.18, solana: -1.49, sp500: 2.22, nasdaq: 5.49, russell2000: 1.94, realEstate: 1.21, gold: -7.17, silver: -6.34, wtiOil: 10.79, riskFree: 0.05 },
    "2021-07": { bitcoin: 18.8, ethereum: 11.26, solana: -7.05, sp500: 2.27, nasdaq: 1.16, russell2000: -4.3, realEstate: 0.8, gold: 2.9, silver: -2.7, wtiOil: 0.0, riskFree: 0.06 },
    "2021-08": { bitcoin: 13.32, ethereum: 35.65, solana: 201.69, sp500: 2.9, nasdaq: 4.0, russell2000: 2.19, realEstate: 0.79, gold: -0.06, silver: -6.17, wtiOil: 0.0, riskFree: 0.04 },
    "2021-09": { bitcoin: -7.05, ethereum: -14.7, solana: 44.7, sp500: -4.76, nasdaq: -4.38, russell2000: -2.3, realEstate: 0.78, gold: -3.2, silver: -9.5, wtiOil: 0.0, riskFree: 0.04 },
    "2021-10": { bitcoin: 39.9, ethereum: 46.59, solana: 45.33, sp500: 6.91, nasdaq: 7.27, russell2000: 4.13, realEstate: 0.39, gold: 1.5, silver: 7.83, wtiOil: 0.0, riskFree: 0.05 },
    "2021-11": { bitcoin: -7.0, ethereum: 7.97, solana: 1.16, sp500: -0.83, nasdaq: 0.25, russell2000: -2.23, realEstate: 1.17, gold: -0.39, silver: -3.64, wtiOil: -20.81, riskFree: 0.06 },
    "2021-12": { bitcoin: -18.82, ethereum: -20.47, solana: -16.88, sp500: 4.36, nasdaq: 0.69, russell2000: 0.0, realEstate: 0.77, gold: 2.94, silver: 3.61, wtiOil: 13.61, riskFree: 0.06 },
    "2022-01": { bitcoin: -16.96, ethereum: -27.1, solana: -44.41, sp500: -5.26, nasdaq: -8.98, russell2000: -10.62, realEstate: 0.76, gold: -1.74, silver: -3.23, wtiOil: 17.25, riskFree: 0.15 },
    "2022-02": { bitcoin: 12.3, ethereum: 8.78, solana: -7.4, sp500: -3.14, nasdaq: -3.43, russell2000: 1.24, realEstate: 0.76, gold: 5.81, silver: 7.85, wtiOil: 8.59, riskFree: 0.3 },
    "2022-03": { bitcoin: 5.45, ethereum: 12.4, solana: 39.82, sp500: 3.58, nasdaq: 3.4, russell2000: 1.99, realEstate: 1.13, gold: 1.46, silver: 1.43, wtiOil: 13.42, riskFree: 0.52 },
    "2022-04": { bitcoin: -17.18, ethereum: -14.26, solana: -21.0, sp500: -8.8, nasdaq: -11.81, russell2000: -9.59, realEstate: 1.12, gold: -1.71, silver: -5.72, wtiOil: -3.53, riskFree: 0.85 },
    "2022-05": { bitcoin: -15.75, ethereum: -31.0, solana: -53.17, sp500: 0.01, nasdaq: -4.83, russell2000: -1.78, realEstate: 0.37, gold: -3.16, silver: -6.57, wtiOil: 9.53, riskFree: 0.94 },
    "2022-06": { bitcoin: -37.74, ethereum: -45.0, solana: -26.12, sp500: -8.39, nasdaq: -7.51, russell2000: -7.11, realEstate: 0.73, gold: -1.6, silver: -5.86, wtiOil: 0.0, riskFree: 1.65 },
    "2022-07": { bitcoin: 17.99, ethereum: 57.58, solana: 26.34, sp500: 9.11, nasdaq: 12.35, russell2000: 10.24, realEstate: 0.0, gold: -2.4, silver: -1.17, wtiOil: -6.75, riskFree: 2.32 },
    "2022-08": { bitcoin: -14.09, ethereum: -7.72, solana: -24.95, sp500: -4.24, nasdaq: -4.64, russell2000: -1.96, realEstate: 0.0, gold: -2.94, silver: -11.66, wtiOil: -9.21, riskFree: 2.89 },
    "2022-09": { bitcoin: -3.1, ethereum: -14.5, solana: 3.5, sp500: -9.34, nasdaq: -10.5, russell2000: -9.74, realEstate: 0.0, gold: -2.47, silver: 6.44, wtiOil: -11.24, riskFree: 3.26 },
    "2022-10": { bitcoin: 5.49, ethereum: 18.52, solana: -1.43, sp500: 7.99, nasdaq: 3.9, russell2000: 10.93, realEstate: -0.36, gold: -2.1, silver: 0.84, wtiOil: 8.91, riskFree: 3.96 },
    "2022-11": { bitcoin: -16.21, ethereum: -17.59, solana: -58.2, sp500: 5.38, nasdaq: 4.37, russell2000: 0.87, realEstate: -0.36, gold: 7.41, silver: 12.1, wtiOil: -6.92, riskFree: 4.36 },
    "2022-12": { bitcoin: -3.65, ethereum: -7.78, solana: -28.3, sp500: -5.9, nasdaq: -8.73, russell2000: -5.6, realEstate: -0.37, gold: 3.73, silver: 11.47, wtiOil: -0.36, riskFree: 4.34 },
    "2023-01": { bitcoin: 39.77, ethereum: 32.78, solana: 150.57, sp500: 6.18, nasdaq: 10.68, russell2000: 7.52, realEstate: -0.37, gold: 5.69, silver: -1.88, wtiOil: -2.71, riskFree: 4.61 },
    "2023-02": { bitcoin: 0.09, ethereum: 1.14, solana: -10.3, sp500: -2.61, nasdaq: -1.11, russell2000: -0.05, realEstate: -0.37, gold: -5.17, silver: -11.57, wtiOil: -1.68, riskFree: 4.78 },
    "2023-03": { bitcoin: 22.96, ethereum: 13.5, solana: -3.86, sp500: 3.51, nasdaq: 5.0, russell2000: -6.45, realEstate: 0.0, gold: 7.79, silver: 15.1, wtiOil: -4.62, riskFree: 4.64 },
    "2023-04": { bitcoin: 2.8, ethereum: 0.44, solana: 4.35, sp500: 1.46, nasdaq: 1.7, russell2000: -0.79, realEstate: 0.37, gold: 1.07, silver: 4.1, wtiOil: 4.87, riskFree: 4.99 },
    "2023-05": { bitcoin: -7.01, ethereum: 3.77, solana: -10.53, sp500: 0.25, nasdaq: 5.8, russell2000: 0.17, realEstate: 0.37, gold: -2.37, silver: -7.35, wtiOil: -6.76, riskFree: 5.2 },
    "2023-06": { bitcoin: 12.0, ethereum: 1.47, solana: -22.45, sp500: 6.47, nasdaq: 5.8, russell2000: 6.54, realEstate: 0.37, gold: -1.24, silver: -1.81, wtiOil: -1.88, riskFree: 5.3 },
    "2023-07": { bitcoin: -4.14, ethereum: -4.14, solana: 55.73, sp500: 3.11, nasdaq: 4.73, russell2000: 5.71, realEstate: 0.73, gold: 2.04, silver: 8.48, wtiOil: 16.44, riskFree: 5.37 },
    "2023-08": { bitcoin: -11.29, ethereum: -11.79, solana: -16.35, sp500: -1.77, nasdaq: -2.17, russell2000: -5.57, realEstate: 0.73, gold: -1.02, silver: -1.74, wtiOil: -0.2, riskFree: 5.4 },
    "2023-09": { bitcoin: 3.96, ethereum: 2.18, solana: 0.56, sp500: -4.87, nasdaq: -5.81, russell2000: -5.88, realEstate: 0.72, gold: -4.7, silver: -8.33, wtiOil: 10.97, riskFree: 5.47 },
    "2023-10": { bitcoin: 28.53, ethereum: 8.8, solana: 81.11, sp500: -2.2, nasdaq: -2.78, russell2000: -7.5, realEstate: 0.36, gold: 7.28, silver: 2.71, wtiOil: -10.76, riskFree: 5.42 },
    "2023-11": { bitcoin: 8.78, ethereum: 15.4, solana: 61.59, sp500: 8.92, nasdaq: 10.7, russell2000: 10.04, realEstate: 0.71, gold: 2.79, silver: 9.96, wtiOil: -6.2, riskFree: 5.27 },
    "2023-12": { bitcoin: 12.15, ethereum: 9.37, solana: 75.39, sp500: 4.42, nasdaq: 5.52, russell2000: 13.07, realEstate: 0.0, gold: 1.28, silver: -5.5, wtiOil: -5.34, riskFree: 5.26 },
    "2024-01": { bitcoin: 1.52, ethereum: -2.5, solana: -8.49, sp500: 1.59, nasdaq: 0.58, russell2000: -3.83, realEstate: 0.35, gold: -1.55, silver: -4.1, wtiOil: 5.45, riskFree: 5.22 },
    "2024-02": { bitcoin: 42.68, ethereum: 51.43, solana: 39.16, sp500: 5.17, nasdaq: 6.12, russell2000: 3.1, realEstate: 0.7, gold: 0.64, silver: 0.0, wtiOil: 1.9, riskFree: 5.24 },
    "2024-03": { bitcoin: 13.8, ethereum: 3.92, solana: 50.47, sp500: 3.1, nasdaq: 1.79, russell2000: 5.61, realEstate: 0.35, gold: 9.12, silver: 10.18, wtiOil: 5.32, riskFree: 5.2 },
    "2024-04": { bitcoin: -12.93, ethereum: -15.0, solana: -30.34, sp500: -4.29, nasdaq: -4.41, russell2000: -6.22, realEstate: 0.35, gold: 3.0, silver: 5.83, wtiOil: 0.71, riskFree: 5.23 },
    "2024-05": { bitcoin: 11.34, ethereum: 26.25, solana: 23.09, sp500: 5.06, nasdaq: 6.88, russell2000: 3.87, realEstate: 0.7, gold: 1.3, silver: 14.34, wtiOil: -5.43, riskFree: 5.25 },
    "2024-06": { bitcoin: -7.13, ethereum: -10.39, solana: -17.93, sp500: 3.47, nasdaq: 5.98, russell2000: -1.0, realEstate: 0.35, gold: -0.17, silver: -4.13, wtiOil: 5.12, riskFree: 5.25 },
    "2024-07": { bitcoin: 3.05, ethereum: -5.92, solana: 26.52, sp500: 1.13, nasdaq: -0.75, russell2000: 9.99, realEstate: 0.34, gold: 3.27, silver: -3.71, wtiOil: -4.45, riskFree: 5.15 },
    "2024-08": { bitcoin: -8.74, ethereum: -20.8, solana: -23.02, sp500: 2.3, nasdaq: -0.47, russell2000: -2.27, realEstate: 0.0, gold: 4.25, silver: 3.0, wtiOil: -5.59, riskFree: 4.92 },
    "2024-09": { bitcoin: 7.3, ethereum: 4.82, solana: 15.84, sp500: 2.0, nasdaq: 2.3, russell2000: 0.27, realEstate: 0.0, gold: 4.56, silver: 9.16, wtiOil: -7.24, riskFree: 4.68 },
    "2024-10": { bitcoin: 9.74, ethereum: -2.08, solana: 6.88, sp500: 0.53, nasdaq: 1.43, russell2000: 2.44, realEstate: 0.0, gold: 3.98, silver: 3.7, wtiOil: -1.15, riskFree: 4.62 },
    "2024-11": { bitcoin: 39.36, ethereum: 22.56, solana: 25.77, sp500: 3.92, nasdaq: 4.8, russell2000: 6.47, realEstate: -0.34, gold: -2.13, silver: -6.23, wtiOil: 0.96, riskFree: 4.5 },
    "2024-12": { bitcoin: -3.14, ethereum: 1.11, solana: -17.05, sp500: -1.03, nasdaq: 3.46, russell2000: -3.53, realEstate: -0.34, gold: 0.3, silver: 2.52, wtiOil: 2.63, riskFree: 4.35 }
  };

  const investments: Investment[] = [
    {
      name: 'Bitcoin',
      symbol: 'bitcoin',
      color: '#F7931A',
      icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/langfr-250px-Bitcoin.svg.png" alt="Bitcoin" width={24} height={24} />,
      category: 'crypto'
    },
    {
      name: 'Ethereum',
      symbol: 'ethereum',
      color: '#627EEA',
      icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/langfr-250px-Ethereum-icon-purple.svg.png" alt="Ethereum" width={24} height={24} />,
      category: 'crypto'
    },
    {
      name: 'Solana',
      symbol: 'solana',
      color: '#9945FF',
      icon: <Image src="https://upload.wikimedia.org/wikipedia/fr/f/f2/SolanaLogoMark.png" alt="Solana" width={24} height={24} />,
      category: 'crypto'
    },
    {
      name: 'S&P 500',
      symbol: 'sp500',
      color: '#2563EB',
      icon: <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">S&P</div>,
      category: 'traditional'
    },
    {
      name: 'NASDAQ',
      symbol: 'nasdaq',
      color: '#00D4FF',
      icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/NASDAQ_Logo.svg/langfr-250px-NASDAQ_Logo.svg.png" alt="Nasdaq" width={24} height={24} />,
      category: 'traditional'
    },
    {
      name: 'Russell 2000',
      symbol: 'russell2000',
      color: '#FF6B6B',
      icon: <div className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">R2K</div>,
      category: 'traditional'
    },
    {
      name: 'Real Estate',
      symbol: 'realEstate',
      color: '#8B5CF6',
      icon: <Shield className="w-6 h-6" />,
      category: 'traditional'
    },
    {
      name: 'Gold',
      symbol: 'gold',
      color: '#FFD700',
      icon: <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs">Au</div>,
      category: 'commodities'
    },
    {
      name: 'Silver',
      symbol: 'silver',
      color: '#C0C0C0',
      icon: <Shield className="w-6 h-6" />,
      category: 'commodities'
    },
    {
      name: 'WTI Oil',
      symbol: 'wtiOil',
      color: '#8B4513',
      icon: <div className="w-6 h-6 bg-amber-800 rounded-full flex items-center justify-center text-white font-bold text-xs">Oil</div>,
      category: 'commodities'
    }
  ];

  const getAssetReturns = (asset: string): number[] => {
    const returns: number[] = [];
    Object.values(monthlyReturnsData).forEach(month => {
      const value = month[asset as keyof MonthlyReturns];
      if (value !== null && value !== undefined) {
        returns.push(value / 100);
      }
    });
    return returns;
  };

  const getMarketReturns = (): number[] => {
    return Object.values(monthlyReturnsData).map(month => month.sp500 / 100);
  };

  const getRiskFreeRates = (): number[] => {
    return Object.values(monthlyReturnsData).map(month => month.riskFree / 100);
  };

  const getFullMetrics = (asset: string): AdvancedMetrics => {
    const returns = getAssetReturns(asset);
    const marketReturns = getMarketReturns();
    const riskFreeRates = getRiskFreeRates();
    return calculateAdvancedMetrics(returns, marketReturns, riskFreeRates);
  };

  const getRiskLevel = (volatility: number): { level: string; color: string } => {
    if (volatility < 10) return { level: 'Low', color: 'text-green-400' };
    if (volatility < 25) return { level: 'Medium', color: 'text-yellow-400' };
    if (volatility < 50) return { level: 'High', color: 'text-orange-400' };
    return { level: 'Extreme', color: 'text-red-400' };
  };

  const getRiskBadgeClasses = (volatility: number): string => {
    if (volatility < 10) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (volatility < 25) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (volatility < 50) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const toggleAsset = (symbol: string) => {
    setSelectedAssets(prev =>
      prev.includes(symbol)
        ? prev.filter(a => a !== symbol)
        : [...prev, symbol]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Risk Analysis</h1>
        </div>

        <div className="mb-8 p-6 rounded-xl border border-white/10 bg-white/5">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Basic Risk Assessment
          </h2>
          <p className="text-gray-400 mb-4">Compare assets across three fundamental risk metrics:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white font-medium mb-1"><InfoTip text="Standard deviation of returns, annualized. Lower = more stable. Example: 15% volatility means prices typically swing 15% per year.">Volatility</InfoTip></p>
              <p className="text-gray-400 text-sm">Measures the annualized standard deviation of monthly returns. Higher volatility means larger price swings.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white font-medium mb-1"><InfoTip text="Risk-adjusted returns. Above 1 = good, above 2 = excellent. A Sharpe of 1.5 means you earned 1.5% extra return for each 1% of risk taken.">Sharpe Ratio</InfoTip></p>
              <p className="text-gray-400 text-sm">Risk-adjusted return metric. Higher values indicate better return per unit of risk taken.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white font-medium mb-1"><InfoTip text="Largest peak-to-trough decline. Shows worst-case scenario. Example: -53% means an investor would have lost over half their value at the worst point.">Max Drawdown</InfoTip></p>
              <p className="text-gray-400 text-sm">The largest peak-to-trough decline observed. Shows the worst-case cumulative loss scenario.</p>
            </div>
          </div>
        </div>

        <div className="mb-8 p-6 rounded-xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Select Assets to Compare</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {investments.map(inv => (
              <button
                key={inv.symbol}
                onClick={() => toggleAsset(inv.symbol)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                  selectedAssets.includes(inv.symbol)
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="flex-shrink-0">{inv.icon}</div>
                <span className="truncate">{inv.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {selectedAssets.map(assetSymbol => {
            const investment = investments.find(inv => inv.symbol === assetSymbol);
            if (!investment) return null;
            const metrics = getFullMetrics(assetSymbol);
            const riskLevel = getRiskLevel(metrics.volatility);
            const badgeClasses = getRiskBadgeClasses(metrics.volatility);
            const isExpanded = expandedAsset === assetSymbol;

            return (
              <div key={assetSymbol} className="p-5 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">{investment.icon}</div>
                    <span className="text-white font-semibold">{investment.name}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${badgeClasses}`}>
                    {riskLevel.level}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm"><InfoTip text="Annualized standard deviation. Lower = more stable.">Volatility</InfoTip></span>
                    <span className={`font-mono font-medium ${riskLevel.color}`}>{metrics.volatility.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm"><InfoTip text="Return per unit of risk. Above 1 is good, above 2 is excellent.">Sharpe</InfoTip></span>
                    <span className={`font-mono font-medium ${metrics.sharpeRatio >= 1 ? 'text-green-400' : metrics.sharpeRatio >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>{metrics.sharpeRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm"><InfoTip text="Like Sharpe but only penalizes downside risk. Higher = better risk-adjusted returns.">Sortino</InfoTip></span>
                    <span className={`font-mono font-medium ${metrics.sortinoRatio >= 1.5 ? 'text-green-400' : metrics.sortinoRatio >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>{metrics.sortinoRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm"><InfoTip text="Worst peak-to-trough decline.">Max Drawdown</InfoTip></span>
                    <span className="font-mono font-medium text-red-400">-{metrics.maxDrawdown.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm"><InfoTip text="Sensitivity to market (S&P 500). Beta=1 moves with market, >1 amplifies, <1 dampens.">Beta</InfoTip></span>
                    <span className={`font-mono font-medium ${metrics.beta >= 0.8 && metrics.beta <= 1.2 ? 'text-blue-400' : metrics.beta < 0.8 ? 'text-green-400' : 'text-orange-400'}`}>{metrics.beta.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm"><InfoTip text="Excess return vs market after adjusting for beta. Positive = outperforming.">Alpha</InfoTip></span>
                    <span className={`font-mono font-medium ${metrics.alpha >= 0 ? 'text-green-400' : 'text-red-400'}`}>{metrics.alpha >= 0 ? '+' : ''}{metrics.alpha.toFixed(1)}%</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm"><InfoTip text="Return divided by max drawdown. Higher = better recovery ability.">Calmar</InfoTip></span>
                      <span className={`font-mono font-medium ${metrics.calmarRatio >= 1 ? 'text-green-400' : 'text-yellow-400'}`}>{metrics.calmarRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm"><InfoTip text="Standard deviation of negative returns only. Lower = less downside risk.">Downside Dev</InfoTip></span>
                      <span className="font-mono font-medium text-gray-300">{metrics.downsideDeviation.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm"><InfoTip text="Percentage of months with positive returns.">Win Rate</InfoTip></span>
                      <span className={`font-mono font-medium ${metrics.winRate >= 55 ? 'text-green-400' : metrics.winRate >= 45 ? 'text-yellow-400' : 'text-red-400'}`}>{metrics.winRate.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm"><InfoTip text="Maximum expected monthly loss at 95% confidence. 5% chance of losing more.">VaR (95%)</InfoTip></span>
                      <span className="font-mono font-medium text-red-400">-{metrics.var95.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm"><InfoTip text="Expected loss in the worst 5% of months. Worse than VaR - the tail risk.">CVaR</InfoTip></span>
                      <span className="font-mono font-medium text-red-400">-{metrics.cvar95.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm"><InfoTip text="Return per unit of systematic (market) risk. Like Sharpe but uses beta instead of total volatility.">Treynor</InfoTip></span>
                      <span className={`font-mono font-medium ${metrics.treynorRatio >= 0 ? 'text-green-400' : 'text-red-400'}`}>{metrics.treynorRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm"><InfoTip text="Active return per unit of tracking error vs benchmark. Higher = more consistent outperformance.">Info Ratio</InfoTip></span>
                      <span className={`font-mono font-medium ${metrics.informationRatio >= 0.5 ? 'text-green-400' : metrics.informationRatio >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>{metrics.informationRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm"><InfoTip text="How much of the market's gains the asset captures when market is up. Above 100% = amplifies gains.">Upside Cap.</InfoTip></span>
                      <span className={`font-mono font-medium ${metrics.upsideCapture >= 100 ? 'text-green-400' : 'text-yellow-400'}`}>{metrics.upsideCapture.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm"><InfoTip text="How much of the market's losses the asset absorbs when market is down. Below 100% = defensive.">Downside Cap.</InfoTip></span>
                      <span className={`font-mono font-medium ${metrics.downsideCapture <= 100 ? 'text-green-400' : 'text-red-400'}`}>{metrics.downsideCapture.toFixed(0)}%</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setExpandedAsset(isExpanded ? null : assetSymbol)}
                  className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
                >
                  {isExpanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> All 15 metrics</>}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6">
          <h3 className="text-lg font-bold mb-2"><InfoTip text="Shows how each asset's volatility (annualized standard deviation) changes year by year from 2014 to 2024. Darker red = more volatile. Grey cells = asset didn't exist yet.">Volatility Over Time</InfoTip></h3>
          <p className="text-gray-400 text-sm mb-4">How each asset&apos;s annualized volatility evolved across years. Red cells indicate high price swings; green cells indicate stability.</p>
          <VolatilityHeatmap />
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6">
          <h3 className="text-lg font-bold mb-4"><InfoTip text="Shows how assets move together. +1 = same direction, -1 = opposite, 0 = independent. Low correlation = better diversification.">Asset Correlation Matrix</InfoTip></h3>
          <CorrelationMatrix />
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6">
          <h3 className="text-lg font-bold mb-4"><InfoTip text="Each point is an asset. X-axis = risk (volatility), Y-axis = average monthly return. Bigger points have better Sharpe ratios (more return per unit of risk). Ideal assets are top-left: high return, low risk.">Risk-Return Analysis</InfoTip></h3>
          <RiskReturnScatter />
        </div>

        <div className="mt-8 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
