import React from 'react';
import {
  Shield,
  User,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  FileEdit,
  Database,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { ChatMessage, Citation } from '../types';
import { CitationCard } from './CitationCard';

interface MessageBubbleProps {
  message: ChatMessage;
  onInspectCitation: (citation: Citation) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onInspectCitation }) => {
  const isUser = message.sender === 'user';
  const data = message.responseData;

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 max-w-4xl ml-auto mb-6">
        <div className="flex flex-col items-end max-w-2xl">
          <div className="bg-[#0a2540] text-white px-5 py-3.5 rounded-2xl rounded-tr-xs shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="text-[11px] text-slate-600 mt-1 mr-1">{message.timestamp}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Assistant Bubble
  return (
    <div className="flex gap-3 max-w-5xl mr-auto mb-8 animate-in fade-in duration-200">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0a2540] to-[#174574] text-white flex items-center justify-center flex-shrink-0 shadow-md">
        <Shield className="w-5 h-5 text-teal-300" />
      </div>

      <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-5 shadow-xs">
        {/* Assistant Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#0a2540]">CIDAN Assistant</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              Banking Regulatory RAG
            </span>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <span className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono">
                Model: {data.model_used}
              </span>
            )}
            <span className="text-[11px] text-slate-600">{message.timestamp}</span>
          </div>
        </div>

        {/* Final answer only */}
        {data && (
          <div className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
            {data.answer || data.summary}
          </div>
        )}

        {/* Fallback if raw text content without responseData */}
        {!data && (
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
};
