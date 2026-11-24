import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { EvidenceModal } from './components/EvidenceModal';
import { ChatAssistant } from './pages/ChatAssistant';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { RegulatoryObligations } from './pages/RegulatoryObligations';
import { PolicyMapping } from './pages/PolicyMapping';
import { RuleDrafts } from './pages/RuleDrafts';
import { ChatMessage, Citation, HealthResponse, DocumentItem } from './types';
import { fetchHealth, fetchDocuments, sendChatMessage } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [inspectingCitation, setInspectingCitation] = useState<Citation | null>(null);

  const loadData = async () => {
    try {
      const [healthData, docsData] = await Promise.all([
        fetchHealth(),
        fetchDocuments(),
      ]);
      setHealth(healthData);
      setDocuments(docsData);
    } catch (err) {
      console.warn('Backend not fully reachable yet:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNewChat = () => {
    setMessages([]);
    setCurrentTab('chat');
  };

  const handleOpenUpload = () => {
    setCurrentTab('knowledge_base');
  };

  const handleAskQuestionInChat = (query: string) => {
    setCurrentTab('chat');
    // Pre-populate or trigger chat message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Send query to backend
    sendChatMessage(query).then((res) => {
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: res.answer,
        responseData: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }).catch((err) => {
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        content: `Error retrieving compliance response: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    });

  };

  const getPageMeta = () => {
    switch (currentTab) {
      case 'chat':
        return {
          title: 'CIDAN Compliance Assistant',
          subtitle: 'Grounded Regulatory Question Answering & Obligation Extraction',
        };
      case 'knowledge_base':
        return {
          title: 'Knowledge Base & Vector Store',
          subtitle: 'Document Ingestion, ChromaDB Embeddings & Chunking Telemetry',
        };
      case 'obligations':
        return {
          title: 'Regulatory Obligations Register',
          subtitle: 'Statutory Mandates, Prudential Ratios & Deadline Tracking',
        };
      case 'policy_mapping':
        return {
          title: 'Circular vs Policy Mapping Matrix',
          subtitle: 'Alignment Analysis, Internal Gaps & Remediation Triggers',
        };
      case 'rule_drafts':
        return {
          title: 'Proposed Rule Amendments',
          subtitle: 'Draft Policy Revisions Requiring Authorized Human Approval',
        };
    }
  };

  const pageMeta = getPageMeta();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNewChat={handleNewChat}
        health={health}
        docCount={documents.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          health={health}
          onOpenUpload={handleOpenUpload}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {currentTab === 'chat' && (
            <ChatAssistant
              messages={messages}
              setMessages={setMessages}
              onInspectCitation={setInspectingCitation}
              onNavigateToKnowledgeBase={() => setCurrentTab('knowledge_base')}
            />
          )}

          {currentTab === 'knowledge_base' && (
            <KnowledgeBase
              documents={documents}
              onRefreshDocs={loadData}
            />
          )}

          {currentTab === 'obligations' && (
            <RegulatoryObligations
              onAskQuestionInChat={handleAskQuestionInChat}
            />
          )}

          {currentTab === 'policy_mapping' && (
            <PolicyMapping
              onDraftRuleForMapping={() => setCurrentTab('rule_drafts')}
              onAskInChat={handleAskQuestionInChat}
            />
          )}

          {currentTab === 'rule_drafts' && <RuleDrafts />}
        </main>
      </div>

      {/* Traceable Evidence Inspector Modal */}
      <EvidenceModal
        citation={inspectingCitation}
        onClose={() => setInspectingCitation(null)}
      />
    </div>
  );
};

export default App;
