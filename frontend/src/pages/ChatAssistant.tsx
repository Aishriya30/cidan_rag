import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  Sparkles,
  Shield,
  Layers,
  Database,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { ChatMessage, Citation, ChatResponse } from '../types';
import { MessageBubble } from '../components/MessageBubble';
import { PromptSuggestions } from '../components/PromptSuggestions';
import { sendChatMessage } from '../services/api';

interface ChatAssistantProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onInspectCitation: (citation: Citation) => void;
  onNavigateToKnowledgeBase: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  messages,
  setMessages,
  onInspectCitation,
  onNavigateToKnowledgeBase,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [topK, setTopK] = useState(4);
  const [docFilter, setDocFilter] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseData: ChatResponse = await sendChatMessage(query, topK, conversationId);

      if (responseData.conversation_id) {
        setConversationId(responseData.conversation_id);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: responseData.answer,
        responseData: responseData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        sender: 'assistant',
        content: `Error communicating with CIDAN compliance backend: ${err.message || 'Please verify the backend server is running.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-50/50 overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="max-w-4xl mx-auto pt-6 pb-12">
            {/* Welcome Hero Banner */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#0a2540] text-teal-300 flex items-center justify-center mx-auto mb-4 shadow-md">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#0a2540] mb-2 tracking-tight">
                Welcome to CIDAN Compliance Assistant
              </h2>
              <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                Ask questions about regulatory circulars, compliance obligations, and internal bank policies.
                Every finding is verified against indexed document evidence with citations.
              </p>
            </div>

            {/* Suggested Prompts */}
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center mb-1">
                Suggested Compliance Prompts
              </div>
              <PromptSuggestions onSelectPrompt={(text) => handleSendMessage(text)} />
            </div>

            {/* Quick Tips Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 max-w-2xl mx-auto flex items-start gap-3 shadow-2xs">
              <Database className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800 block">
                  Ground Truth & Traceability Assurance:
                </span>
                <p>
                  CIDAN indexes regulatory circulars into ChromaDB with exact page and chunk mapping.
                  If supporting evidence is insufficient, CIDAN clearly declares it rather than fabricating regulatory interpretations.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onInspectCitation={onInspectCitation}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-2xl mr-auto mb-8 animate-in fade-in duration-150">
                <div className="w-9 h-9 rounded-xl bg-[#0a2540] text-teal-300 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-xs flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 block">
                      Retrieving Grounded Regulatory Evidence...
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Querying ChromaDB vector space & synthesizing traceable compliance advice
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Container */}
      <div className="bg-white border-t border-slate-200 px-6 py-4 shadow-lg sticky bottom-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 flex-shrink-0">
              Quick Inquiries:
            </span>
            <button
              onClick={() => handleSendMessage('Summarize the Prudential Liquidity Circular CB-2024-09.')}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap cursor-pointer transition-colors"
            >
              Summarize Circular CB-2024-09
            </button>
            <button
              onClick={() => handleSendMessage('What are the minimum LCR ratio and reporting obligations?')}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap cursor-pointer transition-colors"
            >
              LCR Obligations & Thresholds
            </button>
            <button
              onClick={() => handleSendMessage('Identify gaps between Circular CB-2024-09 and internal policy POL-TREAS-04.')}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap cursor-pointer transition-colors"
            >
              Policy Gap: CB-2024-09 vs POL-TREAS-04
            </button>
            <button
              onClick={() => handleSendMessage('What cloud vendor recovery time (RTO) standards are mandated?')}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap cursor-pointer transition-colors"
            >
              Cloud Vendor RTO Standards
            </button>
          </div>

          {/* Textarea & Send Control */}
          <div className="relative flex items-center bg-slate-50 border border-slate-300 rounded-xl focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a regulatory compliance question, request obligations breakdown, or test rule changes..."
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
            />
            <div className="flex items-center gap-2 pr-3">
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                  inputValue.trim() && !isLoading
                    ? 'bg-[#0a2540] text-teal-300 hover:bg-[#103459] shadow-md cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title="Send compliance query"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <div className="flex items-center gap-3">
              <span>Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px]">Enter</kbd> to submit</span>
              <span>•</span>
              <span>Evidence Threshold: Cosine ≥ 0.22</span>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="hover:text-slate-800 underline cursor-pointer"
              >
                Reset Conversation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
