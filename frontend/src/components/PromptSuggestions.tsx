import React from 'react';
import { BookOpen, FileCheck, Layers, HelpCircle, ArrowRight } from 'lucide-react';

interface PromptSuggestionsProps {
  onSelectPrompt: (promptText: string) => void;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      title: 'Summarize Circular',
      description: 'Summarize an uploaded regulatory circular.',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Identify Obligations',
      description: 'Identify the obligations introduced by this circular.',
      icon: FileCheck,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      title: 'Map Internal Policies',
      description: 'Find internal policies related to an obligation.',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      title: 'Inspect Compliance Evidence',
      description: 'Explain which evidence supports a compliance answer.',
      icon: HelpCircle,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6 max-w-4xl mx-auto">
      {suggestions.map((item, idx) => {
        const Icon = item.icon;
        return (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.description)}
            className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-md transition-all duration-200 text-left group cursor-pointer"
          >
            <div className={`p-2.5 rounded-lg border flex-shrink-0 ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-[#0a2540] group-hover:text-teal-700 transition-colors">
                  {item.title}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                {item.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
