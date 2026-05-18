import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Educational Assistant | Investment Comparator',
  description:
    'AI-powered educational assistant to help you understand financial concepts and navigate the Investment Comparator platform.',
};

export default function AssistantPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-md">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Educational Assistant</h1>
        <p className="text-slate-400 mb-6">
          The assistant is now available from every page via the floating button in the bottom-right corner. Click it to start chatting!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
