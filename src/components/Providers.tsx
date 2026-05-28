'use client';

import { ComparatorProvider } from '../context/ComparatorContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ComparatorProvider>
      {children}
    </ComparatorProvider>
  );
}
