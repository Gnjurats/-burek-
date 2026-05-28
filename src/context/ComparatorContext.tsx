'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

type Period = '1y' | '5y' | '10y';

interface ComparatorState {
  selectedAssets: string[];
  setSelectedAssets: React.Dispatch<React.SetStateAction<string[]>>;
  investmentAmount: number;
  setInvestmentAmount: React.Dispatch<React.SetStateAction<number>>;
  analysisPeriod: Period;
  setAnalysisPeriod: React.Dispatch<React.SetStateAction<Period>>;
}

const DEFAULT_ASSETS = ['bitcoin', 'ethereum', 'sp500', 'gold', 'cardano', 'chainlink', 'ftse100', 'qqq'];
const DEFAULT_AMOUNT = 10000;
const DEFAULT_PERIOD: Period = '5y';

const STORAGE_KEYS = {
  assets: 'comparator:selectedAssets',
  amount: 'comparator:investmentAmount',
  period: 'comparator:analysisPeriod',
} as const;

const ComparatorContext = createContext<ComparatorState | null>(null);

export function ComparatorProvider({ children }: { children: React.ReactNode }) {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(DEFAULT_ASSETS);
  const [investmentAmount, setInvestmentAmount] = useState<number>(DEFAULT_AMOUNT);
  const [analysisPeriod, setAnalysisPeriod] = useState<Period>(DEFAULT_PERIOD);
  const hydrated = useRef(false);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    try {
      const savedAssets = localStorage.getItem(STORAGE_KEYS.assets);
      if (savedAssets) {
        const parsed = JSON.parse(savedAssets);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedAssets(parsed);
        }
      }

      const savedAmount = localStorage.getItem(STORAGE_KEYS.amount);
      if (savedAmount) {
        const num = Number(savedAmount);
        if (!isNaN(num) && num > 0) {
          setInvestmentAmount(num);
        }
      }

      const savedPeriod = localStorage.getItem(STORAGE_KEYS.period);
      if (savedPeriod && ['1y', '5y', '10y'].includes(savedPeriod)) {
        setAnalysisPeriod(savedPeriod as Period);
      }
    } catch {
      // localStorage unavailable (private mode, etc.)
    }
    hydrated.current = true;
  }, []);

  // Persist to localStorage on change (skip initial render before hydration)
  useEffect(() => {
    if (!hydrated.current) return;
    try { localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(selectedAssets)); } catch {}
  }, [selectedAssets]);

  useEffect(() => {
    if (!hydrated.current) return;
    try { localStorage.setItem(STORAGE_KEYS.amount, String(investmentAmount)); } catch {}
  }, [investmentAmount]);

  useEffect(() => {
    if (!hydrated.current) return;
    try { localStorage.setItem(STORAGE_KEYS.period, analysisPeriod); } catch {}
  }, [analysisPeriod]);

  return (
    <ComparatorContext.Provider value={{
      selectedAssets, setSelectedAssets,
      investmentAmount, setInvestmentAmount,
      analysisPeriod, setAnalysisPeriod,
    }}>
      {children}
    </ComparatorContext.Provider>
  );
}

export function useComparator(): ComparatorState {
  const ctx = useContext(ComparatorContext);
  if (!ctx) throw new Error('useComparator must be used within ComparatorProvider');
  return ctx;
}
