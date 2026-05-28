'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, TrendingDown } from 'lucide-react';
import InfoTip from '../../components/Tooltip';

const InflationHedgeDashboard = dynamic(() => import('../../components/InflationHedgeDashboard'), { ssr: false });

export default function InflationHedgePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Inflation-Hedge Analysis</h1>
        </div>

        <div className="mb-8 p-6 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-amber-400" />
            What is an Inflation Hedge?
          </h2>
          <p className="text-gray-400 mb-4">
            Inflation silently erodes your purchasing power. A <strong className="text-white">nominal return</strong> of +50% sounds great — but if inflation was 35% over the same period, your real gain is only ~11%.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white font-medium mb-1">
                <InfoTip text="The raw percentage change in your investment's price. This is the number you see quoted most often, but it doesn't tell the full story.">Nominal Return</InfoTip>
              </p>
              <p className="text-gray-400 text-sm">The headline number — price change before adjusting for inflation.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white font-medium mb-1">
                <InfoTip text="Calculated using the Fisher equation: Real Return = (1 + Nominal) / (1 + Inflation) - 1. This tells you how much additional purchasing power you actually gained.">Real Return</InfoTip>
              </p>
              <p className="text-gray-400 text-sm">What you actually gained in purchasing power after inflation.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white font-medium mb-1">
                <InfoTip text="An asset is an inflation hedge if its real return is positive — meaning it grew faster than inflation, preserving and growing your purchasing power.">Inflation Hedge</InfoTip>
              </p>
              <p className="text-gray-400 text-sm">An asset that consistently outpaces inflation, protecting your wealth.</p>
            </div>
          </div>
        </div>

        <InflationHedgeDashboard />

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
