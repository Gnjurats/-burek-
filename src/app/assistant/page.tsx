import type { Metadata } from 'next';
import ChatAssistant from '../../components/ChatAssistant';

export const metadata: Metadata = {
  title: 'Educational Assistant | Investment Comparator',
  description:
    'AI-powered educational assistant to help you understand financial concepts and navigate the Investment Comparator platform.',
};

export default function AssistantPage() {
  return <ChatAssistant />;
}
