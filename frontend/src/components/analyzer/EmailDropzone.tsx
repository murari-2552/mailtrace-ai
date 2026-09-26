import React, { useState, useRef } from 'react';
import { UploadCloud, FileCode, Play, Trash2, FileCheck } from 'lucide-react';

interface EmailDropzoneProps {
  onAnalyzeRaw: (content: string) => void;
  onAnalyzeFile: (file: File) => void;
  isLoading: boolean;
}

export const EmailDropzone: React.FC<EmailDropzoneProps> = ({
  onAnalyzeRaw,
  onAnalyzeFile,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedContent, setPastedContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleExecute = () => {
    if (activeTab === 'upload' && selectedFile) {
      onAnalyzeFile(selectedFile);
    } else if (activeTab === 'paste' && pastedContent.trim()) {
      onAnalyzeRaw(pastedContent);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/50">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-3 px-4 text-xs font-mono font-bold flex items-center justify-center gap-2 border-b-2 transition ${
            activeTab === 'upload'
              ? 'border-cyan-500 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>UPLOAD .EML / EMAIL FILE</span>
        </button>

        <button
          onClick={() => setActiveTab('paste')}
          className={`flex-1 py-3 px-4 text-xs font-mono font-bold flex items-center justify-center gap-2 border-b-2 transition ${
            activeTab === 'paste'
              ? 'border-cyan-500 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>PASTE RAW HEADERS & BODY</span>
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'upload' ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px] ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/20'
                : selectedFile
                ? 'border-emerald-500/60 bg-emerald-950/10'
                : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".eml,.txt,.msg"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <FileCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-slate-100 font-mono">{selectedFile.name}</div>
                <div className="text-xs text-slate-400 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB — Ready for forensic ingestion
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-mono mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove File
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <UploadCloud className="w-12 h-12 text-slate-500 mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Drop your suspicious <span className="text-cyan-400 font-mono font-bold">.eml</span> email file here
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Accepts standard RFC 5322 .eml or raw text MIME streams
                  </p>
                </div>
                <span className="inline-block text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition">
                  Browse Files
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              placeholder="Paste raw email message with headers (From, Subject, Received, Authentication-Results, body)..."
              rows={9}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
              <span>{pastedContent.length} characters</span>
              {pastedContent && (
                <button
                  onClick={() => setPastedContent('')}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Text
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={handleExecute}
            disabled={isLoading || (activeTab === 'upload' ? !selectedFile : !pastedContent.trim())}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold px-6 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-950/50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isLoading ? 'ANALYZING EMAIL...' : 'ANALYZE EMAIL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
