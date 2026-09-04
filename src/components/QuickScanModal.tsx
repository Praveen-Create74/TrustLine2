import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrustLine } from '../context/TrustLineContext';
import {
  X,
  Upload,
  FileAudio,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  FileX2,
  Cpu,
  Layers,
  Sparkles,
  Download,
  Radio,
  FileText,
} from 'lucide-react';

export const QuickScanModal: React.FC = () => {
  const {
    isQuickScanOpen,
    setIsQuickScanOpen,
    activeScanResult,
    isAnalyzingFile,
    scanStageIndex,
    analyzeFile,
    startSimulatedCall,
    showToast,
    saveScanResult,
  } = useTrustLine();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  if (!isQuickScanOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      analyzeFile(file);
    }
  };

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
      analyzeFile(e.dataTransfer.files[0]);
    }
  };

  const scanStages = [
    { title: 'Pass 1: Uploading Media', desc: 'Securely uploading file...' },
    { title: 'Pass 2: Cloud AI Analysis', desc: 'Analyzing with cloud threat models...' },
    { title: 'Pass 3: Finalizing Report', desc: 'Synthesizing verdict...' },
  ];

  return (
    <div
      id="quick-scan-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150 font-sans"
    >
      <div
        id="quick-scan-modal-sheet"
        className="w-full max-w-lg bg-[#fef7ff] text-[#1d1b20] rounded-t-[32px] sm:rounded-[32px] p-5 max-h-[92vh] overflow-y-auto shadow-2xl border border-[#e6e1e5] flex flex-col gap-4 animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6750a4] text-white flex items-center justify-center shadow-xs">
              <FileAudio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1d1b20] tracking-tight">
                Quick Scan Forensic Studio
              </h3>
              <p className="text-xs text-[#49454f]">
                Multi-pass deepfake detection for voice notes, audio & video
              </p>
            </div>
          </div>

          <button
            id="btn-close-quick-scan"
            onClick={() => setIsQuickScanOpen(false)}
            className="p-2 rounded-full hover:bg-[#f3edf7] text-[#49454f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Zone / Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-5 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#6750a4] bg-[#e8def8]/40 scale-[1.01]'
              : 'border-[#e6e1e5] bg-[#f3edf7] hover:bg-[#e8def8]/50 hover:border-[#6750a4]/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*,.opus,.m4a,.mp3,.wav,.mp4"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="w-11 h-11 rounded-2xl bg-[#e8def8] text-[#1d192b] flex items-center justify-center mb-1.5 shadow-xs">
            <Upload className="w-5 h-5 text-[#6750a4]" />
          </div>

          <h4 className="text-xs font-bold text-[#1d1b20]">
            Choose an audio or video file or drag & drop here
          </h4>
          <p className="text-[11px] text-[#49454f] mt-0.5">
            Supports MP3, M4A, WAV, MP4, JPEG, PNG
          </p>
        </div>

        {/* 3-Pass Live Analysis Progress */}
        {isAnalyzingFile && (
          <div className="p-4 rounded-2xl bg-[#e8def8]/70 border border-[#6750a4]/30 text-[#1d192b] flex flex-col gap-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#6750a4] animate-spin" />
                <span>Multi-Pass Forensic Pipeline Active</span>
              </span>
              <span className="font-mono text-[#6750a4]">Stage {scanStageIndex + 1} of 3</span>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-1.5">
              {scanStages.map((stg, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs p-1.5 rounded-xl transition-all ${
                    i === scanStageIndex
                      ? 'bg-white font-bold text-[#6750a4] shadow-xs'
                      : i < scanStageIndex
                      ? 'text-emerald-700 font-medium'
                      : 'text-[#79747e] opacity-60'
                  }`}
                >
                  {i < scanStageIndex ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : i === scanStageIndex ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[#6750a4] border-t-transparent animate-spin shrink-0"></div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#cac4d0] shrink-0"></div>
                  )}
                  <div className="truncate">
                    <span className="block leading-tight">{stg.title}</span>
                    {i === scanStageIndex && (
                      <span className="text-[10px] text-[#49454f] font-normal block">
                        {stg.desc}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forensic Report View Card */}
        <AnimatePresence mode="wait">
          {activeScanResult && !isAnalyzingFile && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className={`p-5 rounded-3xl border shadow-sm flex flex-col gap-4 ${
                activeScanResult.tier === 'Fake'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : activeScanResult.tier === 'Doubt'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              }`}
            >
              {/* Top Verdict Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        activeScanResult.tier === 'Fake'
                          ? 'bg-rose-600 text-white'
                          : activeScanResult.tier === 'Doubt'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {activeScanResult.tier === 'Fake'
                        ? '🔴 AI Deepfake Match'
                        : activeScanResult.tier === 'Doubt'
                        ? '🟡 Ambiguous Quality'
                        : '🟢 Verified Human'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1d1b20]">
                    {activeScanResult.fileName}
                  </h4>
                  <p className="text-xs text-[#49454f] mt-0.5">
                    {activeScanResult.fileSize} • {activeScanResult.mimeType}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-3xl font-black font-mono leading-none">
                    {activeScanResult.syntheticProbability.toFixed(1)}%
                  </span>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#79747e] mt-1">
                    AI Probability
                  </p>
                </div>
              </div>

              {/* Core Analysis Breakdown */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#e6e1e5] shadow-xs">
                <span className="text-[11px] font-black text-[#1d1b20] uppercase tracking-wide block mb-2">
                  Cloud Ensemble Analysis
                </span>
                <p className="text-xs text-[#49454f] leading-relaxed">
                  {activeScanResult.verdict}
                </p>
              </div>

              {/* Anomalies List */}
              {activeScanResult.anomaliesDetected.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-black/5 border border-black/10 flex flex-col gap-1.5 text-xs">
                  <span className="font-bold text-[#1d1b20]">Scan Details:</span>
                  {activeScanResult.anomaliesDetected.map((anom, i) => (
                    <div key={i} className="flex items-center gap-2 text-[#1d1b20]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                      <span>{anom}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-black/10">
                <button
                  onClick={() => saveScanResult(activeScanResult)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-[#cac4d0] hover:bg-slate-50 text-xs font-bold text-[#1d1b20] transition-colors"
                >
                  <Download className="w-4 h-4 text-[#6750a4]" />
                  <span>Save Report</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickScanOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6750a4] hover:bg-[#523b88] text-xs font-bold text-white shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Done</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


