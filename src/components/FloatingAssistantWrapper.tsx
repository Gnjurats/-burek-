'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const FloatingAssistant = dynamic(() => import('./FloatingAssistant'), { ssr: false });

export default function FloatingAssistantWrapper() {
  const pathname = usePathname();

  if (pathname === '/assistant') {
    return null;
  }

  return <FloatingAssistant />;
}
