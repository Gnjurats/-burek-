'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:8000';

const QUICK_QUESTIONS = [
  "What is the Sharpe Ratio?",
  "Why is Bitcoin so volatile?",
  "How to diversify my portfolio?",
  "DCA vs lump sum investing?",
  "What's a good risk-adjusted return?",
  "How to interpret correlation?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your educational assistant for the Investment Comparator platform. Ask me anything about financial concepts, risk metrics, or how to use the platform!",
      id: 'welcome',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', id: assistantMessageId },
    ]);

    try {
      const chatHistory = [...messages, userMessage]
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(`${AGENT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No reader available');

      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content' && data.text) {
                accumulatedText += data.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: accumulatedText }
                      : m
                  )
                );
              }
            } catch {
              // Skip malformed SSE chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: "Sorry, an error occurred. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 md:px-6 py-4 flex items-center shadow-xl flex-shrink-0">
        <Link
          href="/"
          className="p-2 hover:bg-blue-800 rounded-lg transition-colors mr-3"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Bot className="w-7 h-7 mr-3" />
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Educational Assistant</h1>
          <p className="text-sm text-blue-200">Ask about investing & finance</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-800 text-gray-200 border border-slate-700 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed text-base">
                  {message.content}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center mt-0.5">
                  <User className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.content === '' && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 border border-slate-700">
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto w-full space-y-3">
          {messages.length <= 1 && (
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    type="button"
                    className="text-sm px-4 py-2 bg-slate-700 text-blue-300 rounded-full hover:bg-slate-600 active:bg-slate-500 transition-colors border border-slate-600 min-h-[36px]"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your question..."
              className="flex-1 px-5 py-3 text-base bg-slate-900 text-white placeholder-gray-500 border border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center">
            Educational only, not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
