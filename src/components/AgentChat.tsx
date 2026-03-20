import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '../types';

interface AgentChatProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: ChatMessage[];
  isLoading: boolean;
  biasPercentage?: number;
  highRiskHours?: number[];
}

export const AgentChat: React.FC<AgentChatProps> = ({
  onSendMessage,
  messages,
  isLoading,
  biasPercentage = 0,
  highRiskHours = []
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    "Which hours tomorrow have the most short-position risk?",
    "Should I adjust my peak bid given recent forecast errors?",
    "What's my expected real-time exposure if I bid the forecast flat?",
    "Compare this Monday's forecast to last Monday's actuals",
    "What's the worst-case scenario for HE17 tomorrow?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await onSendMessage(message);
  };

  const handleStarterClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col" style={{ height: '700px' }}>
        <div className="bg-gradient-to-r from-blue-600 to-slate-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Bot size={32} />
            <div>
              <h3 className="text-xl font-bold">Bid Assistant</h3>
              <p className="text-sm text-blue-100">Ask about tomorrow's forecast or bidding strategy</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="text-center text-slate-500 mt-4">
                <Bot size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="font-medium mb-2">Ask about CAISO day-ahead bidding strategy</p>
                <p className="text-sm">Click a starter prompt below or type your own question</p>
              </div>
              <div className="space-y-2">
                {starterPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleStarterClick(prompt)}
                    className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-sm text-slate-700 hover:text-blue-700 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'agent' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-white" />
              </div>
            )}

            <div
              className={`max-w-[75%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.agent_type && (
                <p className="text-xs mt-2 opacity-75">Agent: {message.agent_type}</p>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div className="bg-slate-100 rounded-lg p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about bidding strategy..."
            className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>

    <div className="hidden lg:block space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-500" />
          DA vs RT Price Spread
        </h4>
        <div className="space-y-3 text-sm">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="font-medium text-slate-700 mb-1">Summer Peak</div>
            <div className="text-slate-600">$20 – $150/MWh</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="font-medium text-slate-700 mb-1">Winter Off-Peak</div>
            <div className="text-slate-600">$5 – $25/MWh</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          {biasPercentage > 0 ? (
            <TrendingUp size={16} className="text-red-500" />
          ) : (
            <TrendingDown size={16} className="text-green-500" />
          )}
          Current Forecast Bias
        </h4>
        <div className={`text-3xl font-bold ${biasPercentage > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {biasPercentage > 0 ? '+' : ''}{biasPercentage.toFixed(1)}%
        </div>
        <div className="text-xs text-slate-500 mt-2">
          {biasPercentage > 0 ? 'Over-forecasting' : biasPercentage < 0 ? 'Under-forecasting' : 'Neutral'}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          Active Risk Hours
        </h4>
        {highRiskHours.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {highRiskHours.map((hour) => (
              <div
                key={hour}
                className="px-3 py-1 bg-red-50 border border-red-200 rounded-md text-sm font-medium text-red-700"
              >
                HE{hour.toString().padStart(2, '0')}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500">No high-risk hours identified</div>
        )}
      </div>
    </div>
  </div>
  );
};
