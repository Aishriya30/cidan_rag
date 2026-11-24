import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Send,
  Lock,
  Layers,
} from 'lucide-react';
import { RuleProposalDraft } from '../types';
import { fetchRuleDrafts, submitRuleDraftAction } from '../services/api';

export const RuleDrafts: React.FC = () => {
  const [drafts, setDrafts] = useState<RuleProposalDraft[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchRuleDrafts()
      .then((data) => setDrafts(data))
      .catch((err) => console.error('Error fetching rule drafts:', err));
  }, []);

  const handleAction = async (draftId: string, actionType: string) => {
    setIsSubmitting(draftId);
    setActionSuccess(null);

    try {
      const res = await submitRuleDraftAction(
        draftId,
        actionType,
        `Review recorded by Chief Compliance Officer at ${new Date().toLocaleTimeString()}`
      );
      setActionSuccess(res.message);
      // Refresh list
      const updated = await fetchRuleDrafts();
      setDrafts(updated);
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-[#0a2540] flex items-center gap-2">
          <FileEdit className="w-6 h-6 text-teal-600" />
          <span>Proposed Rule Changes & Policy Amendments</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Traceable draft policy modifications generated from regulatory circular evidence.
        </p>
      </div>

      {/* Strict Compliance Guardrail Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
        <Lock className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-950 space-y-1">
          <span className="font-bold block">
            MANDATORY GOVERNANCE GATEWAY — DRAFTS REQUIRE AUTHORIZED APPROVAL:
          </span>
          <p className="leading-relaxed text-amber-900">
            CIDAN operates strictly as a decision-support and audit-trail system.
            In accordance with banking regulatory standards, proposed rule changes are never auto-deployed or executed against live bank cores.
            Every proposal requires sign-off from the Compliance Officer, Legal Counsel, and the Board Risk Committee.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Drafts List */}
      <div className="space-y-6">
        {drafts.map((draft) => {
          const isPending = draft.status.includes('DRAFT');
          return (
            <div
              key={draft.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Draft Header */}
              <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                    {draft.id}
                  </span>
                  <h3 className="text-sm font-bold text-[#0a2540]">{draft.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                    {draft.status}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                    Impact: {draft.impact_level}
                  </span>
                </div>
              </div>

              {/* Draft Body */}
              <div className="p-6 space-y-4 text-xs">
                {/* Target Policy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Target Bank Policy</span>
                    <span className="font-semibold text-slate-800">{draft.target_policy}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Clause / Section Reference</span>
                    <span className="font-semibold text-slate-800">{draft.clause_reference}</span>
                  </div>
                </div>

                {/* Text Comparison */}
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Current Internal Baseline Rule
                    </span>
                    <div className="bg-slate-100/70 border border-slate-200 rounded-lg p-3 text-slate-700 font-mono text-[11px]">
                      {draft.current_rule_summary}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block mb-1">
                      Proposed Redline Amendment
                    </span>
                    <div className="bg-teal-50/50 border border-teal-200 rounded-lg p-3 text-teal-950 font-mono text-[11px] leading-relaxed">
                      {draft.proposed_text}
                    </div>
                  </div>
                </div>

                {/* Regulatory Rationale & Sources */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <div>
                    <span className="font-semibold text-slate-800 block mb-0.5">
                      Regulatory Rationale:
                    </span>
                    <p className="text-slate-700 leading-relaxed">{draft.regulatory_rationale}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Evidentiary Citations:</span>
                    <span>{draft.evidence_sources.join(' • ')}</span>
                  </div>
                </div>

                {/* Human Approval Action Bar */}
                {isPending && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Awaiting compliance committee action
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(draft.id, 'REJECT')}
                        disabled={isSubmitting === draft.id}
                        className="px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reject Proposal
                      </button>

                      <button
                        onClick={() => handleAction(draft.id, 'REQUEST_LEGAL_AMENDMENT')}
                        disabled={isSubmitting === draft.id}
                        className="px-3 py-1.5 border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Request Legal Review
                      </button>

                      <button
                        onClick={() => handleAction(draft.id, 'APPROVE_FOR_COMMITTEE_REVIEW')}
                        disabled={isSubmitting === draft.id}
                        className="px-4 py-1.5 bg-[#0a2540] hover:bg-[#103459] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-teal-300" />
                        <span>Approve for Risk Committee Review</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
