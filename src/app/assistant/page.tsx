import type { Metadata } from 'next';
import AssistantPage from '../../components/AssistantPage';

export const metadata: Metadata = {
  title: 'Educational Assistant | Investment Comparator',
  description:
    'Ask questions about investing, finance, and how to use the Investment Comparator platform.',
};

export default function Assistant() {
  return <AssistantPage />;
}
