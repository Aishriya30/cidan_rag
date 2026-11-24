import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Layers,
  ShieldAlert,
  FileCheck2,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { uploadDocument, deleteDocument } from '../services/api';

interface KnowledgeBaseProps {
  documents: DocumentItem[];
  onRefreshDocs: () => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  documents,
  onRefreshDocs,
}) => {
  const [selectedDocType, setSelectedDocType] = useState('Regulatory Circular');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        setUploadMessage({
          type: 'error',
          text: 'Invalid file format. Only PDF and DOCX files are supported.',
        });
        return;
      }
      setSelectedFile(file);
      setUploadMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const res = await uploadDocument(selectedFile, selectedDocType);
      setUploadMessage({
        type: 'success',
        text: res.message || `Successfully indexed '${selectedFile.name}'.`,
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onRefreshDocs();
    } catch (err: any) {
      setUploadMessage({
        type: 'error',
        text: err.message || 'Failed to upload and index document.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string, filename: string) => {
    if (!window.confirm(`Are you sure you want to remove '${filename}' from the vector knowledge base?`)) {
      return;
    }

    setDeletingId(docId);
    try {
      await deleteDocument(docId);
      onRefreshDocs();
    } catch (err: any) {
      alert(`Error deleting document: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto space-y-8">
      {/* Page Title & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#0a2540] flex items-center gap-2">
            <Database className="w-6 h-6 text-teal-600" />
            <span>Compliance Knowledge Base & Vector Index</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload regulatory circulars and internal bank policies. Documents are extracted, chunked with page-level attribution, and indexed into ChromaDB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600">
            Total Indexed Documents: <span className="font-bold text-slate-900">{documents.length}</span>
          </div>
        </div>
      </div>

      {/* Upload Interface Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-[#0a2540] mb-4 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-teal-600" />
          <span>Upload New Regulatory Document or Bank Policy</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Document Type Selector */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Document Classification
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              >
                <option value="Regulatory Circular">Regulatory Circular (Central Bank/Regulator)</option>
                <option value="Internal Bank Policy">Internal Bank Policy (Board/Risk Committee)</option>
                <option value="Operational Guideline">Operational Guideline / SOP</option>
                <option value="Audit Standard">Supervisory Audit Standard</option>
              </select>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800 block">Accepted Formats:</span>
              <p>• PDF (.pdf) with searchable text layer</p>
              <p>• Microsoft Word (.docx)</p>
              <p>• Maximum file size: 25 MB</p>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="md:col-span-2 flex flex-col justify-between">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50/70 hover:bg-slate-50 rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[160px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <div className="text-xs font-semibold text-slate-700 mb-1">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop document'}
              </div>
              <div className="text-[11px] text-slate-500">
                {selectedFile ? `${formatBytes(selectedFile.size)} selected` : 'PDF or DOCX documents'}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-4 flex items-center justify-between">
              {uploadMessage ? (
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium ${
                    uploadMessage.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {uploadMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{uploadMessage.text}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500">Ready to ingest into vector storage</span>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  selectedFile && !isUploading
                    ? 'bg-[#0a2540] hover:bg-[#103459] text-white shadow-xs cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-teal-300" />
                    <span>Extracting & Indexing...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 text-teal-300" />
                    <span>Index Document</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Indexed Documents Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0a2540]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Indexed Documents & Regulatory Circulars ({documents.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Click trash icon to remove document from ChromaDB vector store
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No documents indexed yet. Upload a circular or policy document to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Document Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">File Size</th>
                  <th className="px-4 py-3">Pages</th>
                  <th className="px-4 py-3">Vector Chunks</th>
                  <th className="px-4 py-3">Indexed Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => {
                  const isCircular = doc.doc_type.toLowerCase().includes('circular');
                  return (
                    <tr key={doc.doc_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-900 block truncate max-w-xs" title={doc.filename}>
                              {doc.filename}
                            </span>
                            {doc.is_synthetic_fixture && (
                              <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 rounded mt-0.5">
                                Synthetic Test Fixture
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            isCircular
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {doc.doc_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {formatBytes(doc.file_size_bytes)}
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {doc.page_count} pg
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-mono font-semibold text-[11px]">
                          {doc.chunk_count} chunks
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {doc.upload_timestamp}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Indexed
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(doc.doc_id, doc.filename)}
                          disabled={deletingId === doc.doc_id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete from knowledge base"
                        >
                          {deletingId === doc.doc_id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RAG Verification Architecture Note */}
      <div className="bg-gradient-to-r from-blue-50/70 to-teal-50/70 border border-blue-200/80 rounded-xl p-5 text-xs text-slate-700 space-y-2">
        <div className="flex items-center gap-2 text-[#0a2540] font-bold text-sm">
          <FileCheck2 className="w-4 h-4 text-teal-700" />
          <span>RAG Pipeline Architecture & Grounding Contract</span>
        </div>
        <p className="leading-relaxed">
          CIDAN extracts text sequentially from uploaded PDF and Word documents, tagging each passage with its exact 1-indexed page number and section headings.
          Embeddings are generated via SentenceTransformers (<code>all-MiniLM-L6-v2</code>) and persisted in ChromaDB with cosine indexing.
        </p>
        <p className="leading-relaxed text-slate-600">
          When answering compliance questions, candidate excerpts must satisfy a similarity threshold (≥ 0.22). If no excerpts pass, the system responds with a mandatory insufficient evidence notice rather than extrapolating speculative banking obligations.
        </p>
      </div>
    </div>
  );
};
