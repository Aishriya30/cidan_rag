import React from 'react';
import { X, ShieldCheck, FileText, Bookmark, ExternalLink } from 'lucide-react';
import { Citation } from '../types';

interface EvidenceModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0a2540] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-semibold text-base">Traceable Source Evidence Inspector</h3>
              <p className="text-xs text-slate-300">Grounded regulatory passage indexed in ChromaDB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-600 block">Document Name</span>
              <span className="font-semibold text-slate-800 truncate block" title={citation.document_name}>
                {citation.document_name}
              </span>
            </div>
            <div>
              <span className="text-slate-600 block">Document Type</span>
              <span className="font-semibold text-slate-800">{citation.doc_type}</span>
            </div>
            <div>
              <span className="text-slate-600 block">Page Reference</span>
              <span className="font-semibold text-blue-700">
                {citation.page_number ? `Page ${citation.page_number}` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-600 block">Vector Similarity</span>
              <span className="font-semibold text-teal-700">
                {Math.round(citation.similarity_score * 100)}% Match
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Indexed Passage Excerpt
              </label>
              <span className="text-[11px] text-slate-600 font-mono">
                Chunk ID: {citation.chunk_id}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-serif text-sm leading-relaxed text-slate-800">
              "{citation.excerpt}"
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">Grounded Compliance Attestation:</span> This excerpt was extracted directly from the uploaded source file and converted into embeddings without synthetic modification.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0a2540] text-white text-xs font-semibold rounded-lg hover:bg-[#103459] transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
