import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Building,
  Calendar,
} from 'lucide-react';
import { ObligationItem } from '../types';
import { fetchObligations } from '../services/api';

interface RegulatoryObligationsProps {
  onAskQuestionInChat: (query: string) => void;
}

export const RegulatoryObligations: React.FC<RegulatoryObligationsProps> = ({
  onAskQuestionInChat,
}) => {
  const [obligations, setObligations] = useState<ObligationItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchObligations()
      .then((data) => setObligations(data))
      .catch((err) => console.error('Error fetching obligations:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = obligations.filter((item) => {
    const matchesFilter = filterStatus === 'ALL' || item.compliance_status === filterStatus;
    const matchesSearch =
      item.requirement_summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.circular_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clause.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Compliant':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Compliant
          </span>
        );
      case 'Action Required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Action Required
          </span>
        );
      case 'Pending Policy Revision':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Pending Policy Revision
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
            High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
            Medium Risk
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Low Risk
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-[#0a2540] flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-teal-600" />
          <span>Regulatory Obligations Register</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Identified statutory mandates, prudential ratios, and governance requirements extracted from uploaded circulars.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search obligations, clauses, topics..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Compliant">Compliant</option>
            <option value="Action Required">Action Required</option>
            <option value="Pending Policy Revision">Pending Policy Revision</option>
          </select>
        </div>
      </div>

      {/* Obligations List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-500 hover:shadow-md transition-all shadow-2xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {item.id}
                </span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                  {item.category}
                </span>
                {getRiskBadge(item.risk_rating)}
              </div>
              <div>{getStatusBadge(item.compliance_status)}</div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#0a2540] mb-1">
                {item.clause}
              </h3>
              <div className="text-[11px] text-slate-500 mb-2">
                Circular Driver: <span className="font-semibold text-slate-700">{item.circular_title}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {item.requirement_summary}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Impacted: <strong className="text-slate-700">{item.impacted_functions.join(', ')}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mandatory Deadline: <strong className="text-slate-700">{item.effective_date}</strong></span>
                </div>
              </div>

              <button
                onClick={() =>
                  onAskQuestionInChat(
                    `How does internal bank policy comply with obligation ${item.id} (${item.clause})?`
                  )
                }
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer hover:underline self-end sm:self-auto"
              >
                <span>Investigate in RAG Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
