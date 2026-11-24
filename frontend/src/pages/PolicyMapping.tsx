import React, { useState, useEffect } from 'react';
import {
  GitMerge,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Layers,
} from 'lucide-react';
import { PolicyMappingItem } from '../types';
import { fetchPolicyMappings } from '../services/api';

interface PolicyMappingProps {
  onDraftRuleForMapping: (mapping: PolicyMappingItem) => void;
  onAskInChat: (query: string) => void;
}

export const PolicyMapping: React.FC<PolicyMappingProps> = ({
  onDraftRuleForMapping,
  onAskInChat,
}) => {
  const [mappings, setMappings] = useState<PolicyMappingItem[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchPolicyMappings()
      .then((data) => setMappings(data))
      .catch((err) => console.error('Error fetching policy mappings:', err));
  }, []);

  const filtered = mappings.filter((m) => filter === 'ALL' || m.alignment_status === filter);

  const getAlignmentPill = (status: string) => {
    switch (status) {
      case 'Fully Aligned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Fully Aligned
          </span>
        );
      case 'Gap Identified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Policy Gap Identified
          </span>
        );
      case 'Update Required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Policy Revision Required
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-[#0a2540] flex items-center gap-2">
          <GitMerge className="w-6 h-6 text-teal-600" />
          <span>Circular vs Internal Policy Mapping Matrix</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Automated cross-referencing between supervisory circular clauses and internal bank policies to identify compliance gaps.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs w-fit">
        {['ALL', 'Gap Identified', 'Update Required', 'Fully Aligned'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === tab
                ? 'bg-[#0a2540] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' ? 'All Mappings' : tab}
          </button>
        ))}
      </div>

      {/* Mappings Grid / List */}
      <div className="space-y-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-500 hover:shadow-md transition-all shadow-2xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {item.id}
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {item.circular_title}
                </span>
              </div>
              <div>{getAlignmentPill(item.alignment_status)}</div>
            </div>

            {/* Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Circular Clause */}
              <div className="bg-blue-50/50 border border-blue-200/70 rounded-lg p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                  Regulatory Circular Mandate
                </span>
                <div className="font-semibold text-slate-900">{item.circular_clause}</div>
                <div className="text-slate-600 text-[11px]">Source Circular: {item.circular_title}</div>
              </div>

              {/* Internal Bank Policy */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Internal Bank Policy Reference
                </span>
                <div className="font-semibold text-slate-900">
                  {item.policy_code}: {item.policy_title}
                </div>
                <div className="text-slate-600 text-[11px]">{item.policy_section}</div>
              </div>
            </div>

            {/* Gap Analysis & Action */}
            <div className="space-y-2 text-xs">
              <div className="bg-amber-50/60 border border-amber-200/80 p-3 rounded-lg text-slate-800">
                <span className="font-bold text-amber-900 block mb-1">Gap Analysis:</span>
                <p className="leading-relaxed">{item.gap_analysis}</p>
              </div>

              <div className="bg-teal-50/60 border border-teal-200/80 p-3 rounded-lg text-slate-800">
                <span className="font-bold text-teal-900 block mb-1">Recommended Policy Remediation:</span>
                <p className="leading-relaxed">{item.recommended_action}</p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() =>
                  onAskInChat(
                    `Analyze policy gap for ${item.policy_code} regarding ${item.circular_clause}. What rule changes should we draft?`
                  )
                }
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <span>Run Interactive RAG Gap Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDraftRuleForMapping(item)}
                className="px-3 py-1.5 bg-[#0a2540] hover:bg-[#103459] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Create Proposed Rule Draft
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
