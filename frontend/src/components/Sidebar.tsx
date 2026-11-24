import React from 'react';
import {
  Shield,
  PlusCircle,
  MessageSquare,
  Database,
  ShieldAlert,
  GitMerge,
  FileEdit,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { HealthResponse } from '../types';

export type NavTab =
  | 'chat'
  | 'knowledge_base'
  | 'obligations'
  | 'policy_mapping'
  | 'rule_drafts';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewChat: () => void;
  health: HealthResponse | null;
  docCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNewChat,
  health,
  docCount,
}) => {
  const navItems = [
    {
      id: 'chat' as NavTab,
      label: 'Compliance Assistant',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: 'knowledge_base' as NavTab,
      label: 'Knowledge Base',
      icon: Database,
      badge: docCount > 0 ? `${docCount}` : null,
    },
    {
      id: 'obligations' as NavTab,
      label: 'Regulatory Obligations',
      icon: ShieldAlert,
      badge: '4 Active',
    },
    {
      id: 'policy_mapping' as NavTab,
      label: 'Policy Mapping',
      icon: GitMerge,
      badge: null,
    },
    {
      id: 'rule_drafts' as NavTab,
      label: 'Rule Drafts',
      icon: FileEdit,
      badge: '2 Pending',
    },
  ];

  return (
    <aside className="w-64 bg-[#0a2540] text-slate-200 flex flex-col justify-between h-screen border-r border-[#103459] select-none flex-shrink-0">
      {/* Brand & New Chat */}
      <div className="p-4">
        {/* Brand Header */}
        <div className="flex items-start gap-3 mb-6 px-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-[#0a2540] font-black shadow-lg flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>CIDAN</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                BANKING RAG
              </span>
            </div>
            <div className="text-[10px] text-slate-300 leading-tight mt-0.5 font-medium">
              Compliance Intelligence & Dynamic Adaptation Network
            </div>
          </div>
        </div>

        {/* New Chat Primary Action */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-[#0a2540] font-bold text-xs rounded-xl shadow-md transition-all duration-150 cursor-pointer active:scale-98"
        >
          <PlusCircle className="w-4 h-4 text-[#0a2540]" />
          <span>New Compliance Chat</span>
        </button>

        {/* Navigation items */}
        <nav className="mt-6 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#174574] text-white shadow-xs'
                    : 'text-slate-300 hover:bg-[#103459] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-teal-300' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isActive
                        ? 'bg-teal-400 text-[#0a2540]'
                        : 'bg-slate-700/80 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status & Disclaimers Footer */}
      <div className="p-4 border-t border-[#174574] space-y-3 bg-[#071729]/50">
        {/* RAG Status */}
        <div className="bg-[#103459]/60 rounded-lg p-2.5 border border-[#1e5994]/40 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              RAG Pipeline Status
            </span>
            <span className="text-teal-300 text-[10px]">Active</span>
          </div>
          <div className="text-slate-400 text-[10px] flex items-center justify-between">
            <span>Chroma Vector Store:</span>
            <span className="text-slate-200 font-mono font-medium">
              {health?.chroma_status === 'operational' ? 'Ready' : 'Checking'}
            </span>
          </div>
          <div className="text-slate-400 text-[10px] flex items-center justify-between">
            <span>Grounded Embeddings:</span>
            <span className="text-slate-200 font-mono text-[9px] truncate max-w-[100px]">
              {health?.embedding_model || 'MiniLM-L6-v2'}
            </span>
          </div>
        </div>

        {/* Regulatory Governance Disclaimer */}
        <div className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-tight bg-slate-900/60 p-2 rounded border border-slate-800">
          <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
          <span>
            <strong className="text-slate-300">Regulatory Prototype:</strong> System distinguishes retrieved facts from AI drafts. Authorized compliance officer review mandatory before adoption.
          </span>
        </div>
      </div>
    </aside>
  );
};
