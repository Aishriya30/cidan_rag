import React from 'react';
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Database,
  Cpu,
  UserCheck,
  Building2,
} from 'lucide-react';
import { HealthResponse } from '../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  health: HealthResponse | null;
  onOpenUpload: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  health,
  onOpenUpload,
}) => {
  const isHealthy = health?.status === 'healthy';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base font-bold text-[#0a2540] flex items-center gap-2 m-0 p-0">
          <span>{title}</span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="hidden sm:inline-block text-xs font-normal text-slate-500">
            {subtitle}
          </span>
        </h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* System Status Pills */}
        <div className="hidden lg:flex items-center gap-2">
          {/* RAG Service status */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isHealthy
                ? 'bg-teal-50 text-teal-800 border-teal-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isHealthy ? 'bg-teal-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>RAG Active</span>
          </div>

          {/* Chroma Status */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>
              ChromaDB: {health ? `${health.indexed_chunks_count} Chunks` : 'Connecting...'}
            </span>
          </div>

          {/* LLM Engine */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {health?.llm_status.includes('OpenAI') ? 'OpenAI LLM' : 'Extractive Grounding'}
            </span>
          </div>
        </div>

        {/* Upload Shortcut Button */}
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a2540] hover:bg-[#103459] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 text-teal-300" />
          <span>Upload Document</span>
        </button>

        {/* Profile Placeholder */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs relative">
            <span>CCO</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">A. Vance</div>
            <div className="text-[10px] text-slate-500 leading-tight">Chief Compliance Officer</div>
          </div>
        </div>
      </div>
    </header>
  );
};
