'use client';

import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { Step, EventData } from 'react-joyride';

const steps: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Welcome to Investment Comparator!',
    content: 'Compare 20 assets across crypto, stocks, and commodities using 11 years of real data. This quick tour will show you how.',
  },
  {
    target: '#tour-period',
    title: 'Choose Your Time Period',
    content: 'Select 1 year, 5 years, or 10 years. All percentages and results update instantly when you switch.',
  },
  {
    target: '#tour-investment',
    title: 'Set Your Investment Amount',
    content: 'Enter how much you would have invested. The tool calculates exact returns based on real historical data.',
  },
  {
    target: '#tour-assets',
    title: 'Select Assets to Compare',
    content: 'Click any asset card to add or remove it. Mix crypto, stocks, and commodities to see how they compare side by side.',
    placement: 'top',
  },
  {
    target: '#tour-chart',
    title: 'Performance Chart',
    content: 'All assets start at base 100 for fair comparison. A line reaching 300 means that asset tripled in value over the period.',
  },
  {
    target: '#tour-results',
    title: 'Detailed Results',
    content: 'See final value, profit, return %, and volatility for each selected asset. Color-coded risk badges show Low, Medium, or High risk.',
  },
  {
    target: '#tour-table',
    title: 'Comparison Table',
    content: 'A ranked view of all your selected assets with returns, volatility, and category tags for quick comparison.',
  },
  {
    target: '#tour-explore',
    title: 'Explore More Tools',
    content: 'Try the DCA Calculator to simulate monthly investing, the Risk Analysis dashboard for Sharpe ratios, correlation matrix, and scatter plots, or the Portfolio Optimizer to find your optimal asset allocation on the efficient frontier.',
  },
  {
    target: 'body',
    placement: 'center',
    title: 'AI Assistant Available!',
    content: "You're all set! If you ever have questions about financial concepts, risk metrics, or how to use the platform, our AI assistant is available on every page — look for the blue chat button in the bottom-right corner. Happy investing!",
  },
];

interface GuidedTourProps {
  run: boolean;
  onFinish: () => void;
}

export default function GuidedTour({ run, onFinish }: GuidedTourProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEvent = (data: EventData) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      localStorage.setItem('tour-completed', 'true');
      onFinish();
    }
  };

  if (!mounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      options={{
        backgroundColor: '#1e293b',
        arrowColor: '#1e293b',
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        primaryColor: '#3b82f6',
        textColor: '#f1f5f9',
        showProgress: true,
        scrollOffset: 100,
        buttons: ['back', 'primary', 'skip'],
      }}
      styles={{
        tooltip: {
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        tooltipTitle: {
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: 700,
        },
        tooltipContent: {
          color: '#e2e8f0',
          fontSize: '14px',
          lineHeight: '1.6',
        },
        buttonPrimary: {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 600,
          padding: '10px 20px',
          borderRadius: '8px',
        },
        buttonBack: {
          backgroundColor: '#475569',
          color: '#ffffff',
          marginRight: '10px',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
        },
        buttonSkip: {
          color: '#94a3b8',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
}
