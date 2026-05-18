'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, User, X, MessageCircle, Minimize2 } from 'lucide-react';

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
];

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

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
            ? {
                ...m,
                content:
                  "Sorry, an error occurred. Please check that the assistant backend is running and try again.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Closed state: floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform duration-200 flex items-center gap-2 group"
        aria-label="Open assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium">
          AI Assistant
        </span>
      </button>
    );
  }

  // Minimized state: small header bar
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setIsMinimized(false)}
        >
          <Bot className="w-5 h-5" />
          <span className="text-sm font-semibold">Assistant</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setIsMinimized(false);
            }}
            className="p-1 hover:bg-blue-800 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Open state: chat window
  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-50">
      <div className="w-full h-[100dvh] md:w-[400px] md:h-[600px] bg-slate-900 md:rounded-2xl shadow-2xl flex flex-col md:border md:border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3.5 md:py-3 flex items-center justify-between md:rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Bot className="w-6 h-6 md:w-5 md:h-5" />
            <div>
              <h3 className="font-semibold text-base md:text-sm">Educational Assistant</h3>
              <p className="text-sm md:text-xs text-blue-200">Ask about investing & finance</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 hover:bg-blue-800 rounded transition-colors hidden md:block"
              aria-label="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 md:p-1.5 hover:bg-blue-800 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2.5 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-800 text-gray-200 border border-slate-700 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed text-[15px] md:text-sm">
                  {message.content}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center mt-0.5">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.content === '' && (
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-3 py-2 border border-slate-700">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions + Input */}
        <div className="border-t border-slate-700 bg-slate-800/80 md:rounded-b-2xl flex-shrink-0">
          {messages.length <= 1 && (
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Suggestions</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    type="button"
                    className="text-sm md:text-xs px-3 md:px-2.5 py-2 md:py-1.5 bg-slate-700 text-blue-300 rounded-full hover:bg-slate-600 active:bg-slate-500 transition-colors border border-slate-600 min-h-[36px] md:min-h-0"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="p-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Sharpe Ratio, DCA, volatility..."
              className="flex-1 px-4 py-2.5 text-base md:text-sm bg-slate-900 border border-slate-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          <p className="text-[10px] text-gray-500 pb-2 text-center">
            Educational only, not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
