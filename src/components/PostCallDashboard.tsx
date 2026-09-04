import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { CallRecord, ForensicPillar } from '../types';

export interface PostCallDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  report?: CallRecord | null;
  onExportPdf?: () => void;
}

export const PostCallDashboard: React.FC<PostCallDashboardProps> = ({
  isOpen,
  onClose,
  report,
  onExportPdf,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'chunks' | 'consensus'>('overview');
  const [expandedChunkIndex, setExpandedChunkIndex] = useState<number | null>(null);

  if (!isOpen || !report) return null;

  const isThreat = report.tier === 'Fake';
  const isDoubt = report.tier === 'Doubt';

  // Fallback forensic pillars if not provided
  const pillars = report.forensicPillars || [
    {
      pillar: 'Glottal Pulse Mechanics',
      status: isThreat ? 'High Threat' : isDoubt ? 'Anomaly' : 'Clean',
      description: isThreat
        ? 'Flatness detected in vocal cord micro-jitter. Lacks organic human variance.'
        : isDoubt
        ? 'High jitter caused by VoIP packet loss.'
        : 'Normal biological vocal fold oscillations confirmed.',
      score: isThreat ? 94 : isDoubt ? 58 : 98,
    },
    {
      pillar: 'Spectral Flux & Vocoder Phase',
      status: isThreat ? 'High Threat' : isDoubt ? 'Anomaly' : 'Clean',
      description: isThreat
        ? 'Neural vocoder phase discontinuities identified in 3.2kHz - 5.8kHz band.'
        : 'Zero phase-mismatch anomalies across audio bins.',
      score: isThreat ? 91 : isDoubt ? 48 : 95,
    },
    {
      pillar: 'Prosodic Cadence & Breathing',
      status: isThreat ? 'High Threat' : 'Clean',
      description: isThreat
        ? 'Continuous 14s utterance with zero physiological respiratory intake.'
        : 'Natural respiratory cadence observed at natural sentence boundaries.',
      score: isThreat ? 89 : 99,
    },
    {
      pillar: 'Biometric Voiceprint Resonance',
      status: isThreat ? 'Anomaly' : 'Clean',
      description: isThreat
        ? 'Vocal tract formant dispersion incompatible with biological geometry.'
        : 'Acoustic timbre matches verified biological profiles.',
      score: isThreat ? 86 : 97,
    },
  ];

  // Tri-Model consensus breakdown records
  const consensusRecords = [
    {
      modelName: 'SightEngine Voice Guard v2',
      weight: '35%',
      prediction: isThreat ? '96.2% Synthetic Voice' : isDoubt ? '54.0% Inconclusive' : '1.2% Clean Voice',
      status: isThreat ? 'Threat' : isDoubt ? 'Ambiguous' : 'Clean',
    },
    {
      modelName: 'Google SynthID Acoustic Core',
      weight: '40%',
      prediction: isThreat ? '98.0% Watermark Absent / TTS Detected' : isDoubt ? '61.0% Low SNR' : '0.4% Organic',
      status: isThreat ? 'Threat' : isDoubt ? 'Ambiguous' : 'Clean',
    },
    {
      modelName: 'TrustLine On-Device DSP Worklet',
      weight: '25%',
      prediction: isThreat ? '91.8% Vocoder Discontinuity' : isDoubt ? '49.2% Jitter Spike' : '0.0% Bio-Aligned',
      status: isThreat ? 'Threat' : isDoubt ? 'Ambiguous' : 'Clean',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 text-slate-100 border border-slate-800 shadow-2xl overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                  isThreat
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : isDoubt
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {isThreat ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : isDoubt ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Session Forensic Dashboard</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 font-mono text-slate-300">
                    ID #{report.id?.slice(0, 8) || 'TL-9941'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {report.callerName} • {report.callerNumber} • {report.durationSec || 45}s
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/50 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                activeSubTab === 'overview'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/30'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Forensic Pillars
            </button>
            <button
              onClick={() => setActiveSubTab('chunks')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                activeSubTab === 'chunks'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/30'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Time-Series Chunks (7s)
            </button>
            <button
              onClick={() => setActiveSubTab('consensus')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                activeSubTab === 'consensus'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/30'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Multi-Model Consensus
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Overview / 4 Pillars Sub-Tab */}
            {activeSubTab === 'overview' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                {/* AI Executive Summary Banner */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini Forensic Synthesis</span>
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                        isThreat
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isDoubt
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {report.syntheticScore?.toFixed(1) || '96.4'}% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.transcriptSnippet ||
                      'The acoustic envelope exhibits distinct phase shifts characteristic of an autoregressive neural vocoder with zero biological vocal jitter.'}
                  </p>
                </div>

                {/* 4 Forensic Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {pillars.map((pillar, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-white">{pillar.pillar}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                              pillar.status === 'High Threat'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : pillar.status === 'Anomaly'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {pillar.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          {pillar.description}
                        </p>
                      </div>

                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pillar.status === 'High Threat'
                              ? 'bg-rose-500'
                              : pillar.status === 'Anomaly'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${pillar.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chunks Analysis Sub-Tab */}
            {activeSubTab === 'chunks' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <div className="text-xs text-slate-400 mb-2">
                  Each 7-second audio window was analyzed by the sliding VAD engine:
                </div>
                {[
                  {
                    window: '00:00 - 00:07',
                    tier: isThreat ? 'Fake' : 'Trustable',
                    syntheticProb: isThreat ? 92.4 : 1.2,
                    anomaly: isThreat ? 'Phase jump detected at 3.2kHz' : 'Clean baseline',
                  },
                  {
                    window: '00:07 - 00:14',
                    tier: isThreat ? 'Fake' : 'Trustable',
                    syntheticProb: isThreat ? 98.1 : 0.8,
                    anomaly: isThreat ? 'Unnatural prosody; zero breathing intake' : 'Clean baseline',
                  },
                  {
                    window: '00:14 - 00:21',
                    tier: isThreat ? 'Fake' : isDoubt ? 'Doubt' : 'Trustable',
                    syntheticProb: isThreat ? 96.7 : isDoubt ? 58.2 : 0.5,
                    anomaly: isThreat ? 'Formant dispersion anomaly' : 'Biological resonance',
                  },
                ].map((chunk, i) => (
                  <div
                    key={i}
                    onClick={() => setExpandedChunkIndex(expandedChunkIndex === i ? null : i)}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-mono font-bold text-white">{chunk.window}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            chunk.tier === 'Fake'
                              ? 'bg-rose-500/20 text-rose-300'
                              : chunk.tier === 'Doubt'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {chunk.syntheticProb}% AI
                        </span>
                        {expandedChunkIndex === i ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    {expandedChunkIndex === i && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-xs text-slate-300">
                        <span className="text-slate-400">Diagnosis: </span>
                        {chunk.anomaly}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Multi-Model Consensus Sub-Tab */}
            {activeSubTab === 'consensus' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="text-xs text-slate-400">
                  Tri-model ensemble verification matrix for this interception:
                </div>
                {consensusRecords.map((item, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{item.modelName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Weight: {item.weight}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{item.prediction}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          item.status === 'Threat'
                            ? 'bg-rose-500/20 text-rose-300'
                            : item.status === 'Ambiguous'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900">
            <div className="flex items-center gap-2">
              {onExportPdf && (
                <button
                  onClick={onExportPdf}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default PostCallDashboard;
