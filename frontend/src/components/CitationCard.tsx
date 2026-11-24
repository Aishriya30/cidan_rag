import React from 'react';
import { FileText, ExternalLink, BookmarkCheck } from 'lucide-react';
import { Citation } from '../types';

interface CitationCardProps {
  citation: Citation;
  index: number;
  onInspect: (citation: Citation) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, index, onInspect }) => {
  const matchPct = Math.round(citation.similarity_score * 100);
  const isCircular = citation.doc_type.toLowerCase().includes('circular');

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 hover:border-teal-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center">
              [{index + 1}]
            </span>
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                isCircular
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {citation.doc_type}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              {citation.page_number ? `Page ${citation.page_number}` : 'Page N/A'}
            </span>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                matchPct >= 80
                  ? 'bg-teal-50 text-teal-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
              title="Cosine similarity score against indexed vector"
            >
              {matchPct}% Match
            </span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 mb-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
          <h4
            className="text-xs font-semibold text-slate-900 truncate"
            title={citation.document_name}
          >
            {citation.document_name}
          </h4>
        </div>

        <p className="text-xs text-slate-600 line-clamp-3 italic bg-slate-50/70 p-2 rounded border border-slate-100">
          "{citation.excerpt}"
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-600 flex items-center gap-1">
          <BookmarkCheck className="w-3 h-3 text-teal-600" />
          Traceable Chunk ID: {citation.chunk_id.split('_').slice(-2).join('_')}
        </span>
        <button
          onClick={() => onInspect(citation)}
          className="text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1 group-hover:underline cursor-pointer"
        >
          <span>Inspect</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
