'use client';

import dynamic from 'next/dynamic';

const FloatingAssistant = dynamic(() => import('./FloatingAssistant'), { ssr: false });

export default function FloatingAssistantWrapper() {
  return <FloatingAssistant />;
}
