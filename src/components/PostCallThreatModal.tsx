import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrustLine } from '../context/TrustLineContext';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileDown,
  UserX,
  UserCheck,
  Share2,
  Sparkles,
  Check,
} from 'lucide-react';

export const PostCallThreatModal: React.FC = () => {
  const {
    threatModalCall,
    setThreatModalCall,
    blockCaller,
    unblockCaller,
    allowlistCaller,
    reportToCommunity,
    showToast,
  } = useTrustLine();

  const [aiReport, setAiReport] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [exportedPdf, setExportedPdf] = useState<boolean>(false);

  useEffect(() => {
    if (!threatModalCall) {
      setAiReport(null);
      return;
    }


    // Fetch AI forensic analysis from server API
    const fetchForensicAnalysis = async () => {
      setLoadingAi(true);
      try {
        const response = await fetch('/api/forensics/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callerName: threatModalCall.callerName,
            callerId: threatModalCall.callerNumber,
            platform: threatModalCall.platform,
            durationSec: threatModalCall.durationSec,
            tier: threatModalCall.tier,
            confidenceScore: threatModalCall.syntheticScore,
            spectralFeatures: threatModalCall.threatTags,
            transcriptExcerpt: threatModalCall.transcriptSnippet,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setAiReport(data.analysis);
        }
      } catch (err) {
        console.warn('AI analysis load notice:', err);
      } finally {
        setLoadingAi(false);
      }
    };

    fetchForensicAnalysis();
  }, [threatModalCall]);

  if (!threatModalCall) {
    return null;
  }

  const call = threatModalCall;
  const isFake = call.tier === 'Fake';
  const isDoubt = call.tier === 'Doubt';

  const handleExportReport = () => {
    setExportedPdf(true);
    showToast('Forensic Report downloaded (PDF/JSON)');
    setTimeout(() => setExportedPdf(false), 2500);
  };

  return (
    <AnimatePresence>
      {threatModalCall && (
        <motion.div
          id="threat-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans"
        >
          {/* Framer Motion Splash Animation Layer (Paints the background momentarily) */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: [0, 4, 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`absolute z-[-1] rounded-full w-48 h-48 ${
              isFake ? 'bg-rose-500' : isDoubt ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
          />

          {/* Material 3 BottomSheet Sheet Container */}
          <motion.div
            id="threat-modal-bottom-sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-[#fef7ff] text-[#1d1b20] rounded-t-[32px] sm:rounded-[32px] p-6 max-h-[88vh] overflow-y-auto shadow-2xl border border-[#e6e1e5] flex flex-col gap-4 relative overflow-hidden"
          >
            {/* Top decorative gradient matching threat level */}
            <div className={`absolute top-0 left-0 w-full h-2 ${
                isFake ? 'bg-rose-600' : isDoubt ? 'bg-amber-500' : 'bg-emerald-600'
            }`} />

            {/* BottomSheet Drag Handle */}
        <div className="w-12 h-1.5 bg-[#79747e]/40 rounded-full mx-auto -mt-2 mb-1 sm:hidden"></div>

        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isFake
                  ? 'bg-rose-100 text-rose-800'
                  : isDoubt
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isFake ? (
                <ShieldAlert className="w-7 h-7 text-rose-600" />
              ) : isDoubt ? (
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-[#1d9c5b]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isFake
                      ? 'bg-rose-600 text-white'
                      : isDoubt
                      ? 'bg-amber-500 text-white'
                      : 'bg-[#1d9c5b] text-white'
                  }`}
                >
                  {isFake ? '🔴 Deepfake Threat' : isDoubt ? '🟡 Ambiguous Quality' : '🟢 Verified Human'}
                </span>
                <span className="text-xs text-[#79747e] font-mono">{call.platform}</span>
              </div>
              <h3 className="text-lg font-bold text-[#1d1b20] mt-0.5">{call.callerName}</h3>
              <p className="text-xs text-[#49454f] font-mono">{call.callerNumber}</p>
            </div>
          </div>

          <button
            id="btn-close-threat-modal"
            onClick={() => setThreatModalCall(null)}
            className="p-2 rounded-full hover:bg-[#f3edf7] text-[#49454f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Summary Card */}
        <div
          className={`p-4 rounded-2xl border ${
            isFake
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : isDoubt
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#6750a4]" />
              <span>Forensic Executive Verdict</span>
            </span>
            <span className="font-mono text-sm font-extrabold">
              {call.syntheticScore.toFixed(1)}% Synthetic
            </span>
          </div>

          <p className="text-xs leading-relaxed mt-1">
            {aiReport?.summary ||
              (isFake
                ? 'High-confidence AI synthesized voice detected. The audio exhibits zero biological glottal micro-variations and artificial vocoder phase harmonics.'
                : isDoubt
                ? 'Acoustic metrics are degraded by extreme lossy compression and network packet jitter. Exercise caution before trusting sensitive wire instructions.'
                : 'Acoustic resonance patterns match natural human vocal tract geometry with organic respiratory breath pauses.')}
          </p>

          {aiReport?.recommendation && (
            <div className="mt-2 pt-2 border-t border-black/10 text-[11px] font-semibold flex items-center gap-1.5 text-[#1d1b20]">
              <span>💡 Advisory:</span>
              <span>{aiReport.recommendation}</span>
            </div>
          )}
        </div>

        {/* 4 Forensic Pillars Breakdown */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1d1b20] uppercase tracking-wider">
              Biometric Pillars
            </h4>
            <span className="text-[10px] text-[#79747e]">Dual-tier local/cloud screener</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(aiReport?.forensicPillars || call.forensicPillars).map((pillar: any, idx: number) => {
              const isPillarThreat = pillar.status === 'High Threat';
              const isPillarAnomaly = pillar.status === 'Anomaly';

              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#f3edf7] border border-[#e6e1e5] flex flex-col justify-between text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#1d1b20] truncate">{pillar.pillar}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isPillarThreat
                          ? 'bg-rose-200 text-rose-900'
                          : isPillarAnomaly
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-200 text-emerald-900'
                      }`}
                    >
                      {pillar.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#49454f] leading-tight line-clamp-2">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audio Waveform / Transcript Snippet */}
        <div className="p-3.5 rounded-2xl bg-[#f3edf7] border border-[#e6e1e5] text-xs">
          <div className="flex items-center justify-between text-[#49454f] text-[11px] mb-1.5">
            <span className="font-semibold">Analyzed Audio Excerpt</span>
            <span className="font-mono">{call.durationSec}s recorded</span>
          </div>
          <p className="italic text-[#1d1b20] text-xs">"{call.transcriptSnippet}"</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="pt-2 border-t border-[#e6e1e5] grid grid-cols-2 gap-2.5">
          {/* Block Number */}
          <button
            id="btn-modal-block-number"
            onClick={() => {
              if (call.isBlocked) {
                unblockCaller(call.callerNumber);
              } else {
                blockCaller(call.callerNumber);
              }
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl font-bold text-xs transition-colors shadow-xs ${
              call.isBlocked
                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>{call.isBlocked ? 'Unblock Caller' : 'Block Number'}</span>
          </button>

          {/* Add to Safe List */}
          <button
            id="btn-modal-allowlist"
            onClick={() => allowlistCaller(call.callerName, call.callerNumber)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#e8def8] hover:bg-[#d9cceb] text-[#1d192b] font-bold text-xs transition-colors shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-[#6750a4]" />
            <span>Add to Safe List</span>
          </button>

          {/* Report to Community */}
          <button
            id="btn-modal-report-threat"
            onClick={() => reportToCommunity(call.id)}
            disabled={call.communityReported}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl font-semibold text-xs transition-colors border ${
              call.communityReported
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-[#f3edf7] hover:bg-[#e8def8] text-[#49454f] border-[#e6e1e5]'
            }`}
          >
            <Share2 className="w-4 h-4 text-[#6750a4]" />
            <span>{call.communityReported ? 'Reported to DB ✓' : 'Report Fraud DB'}</span>
          </button>

          {/* Export PDF Report */}
          <button
            id="btn-modal-export-pdf"
            onClick={handleExportReport}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#f3edf7] hover:bg-[#e8def8] text-[#6750a4] font-semibold text-xs border border-[#e6e1e5] transition-colors"
          >
            {exportedPdf ? <Check className="w-4 h-4 text-emerald-600" /> : <FileDown className="w-4 h-4" />}
            <span>{exportedPdf ? 'Exported!' : 'Export PDF Report'}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
    )}
    </AnimatePresence>
  );
};

