import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert, Fingerprint, Volume2, Video } from 'lucide-react';

export interface RiskAlertCardProps {
  isVisible: boolean;
  callerName?: string;
  syntheticRisk: number; // e.g. 64%
  vocoderDiscontinuity?: number; // e.g. 58%
  lipSyncDesyncMs?: number; // e.g. +145ms
  verificationChallenge?: string;
  onDismiss?: () => void;
  onTriggerChallenge?: () => void;
}

export const RiskAlertCard: React.FC<RiskAlertCardProps> = ({
  isVisible,
  callerName = 'Unknown Caller',
  syntheticRisk = 62,
  vocoderDiscontinuity = 58,
  lipSyncDesyncMs = 145,
  verificationChallenge = 'Ask the caller to state a pre-shared passphrase or confirm a recent offline meeting location.',
  onDismiss,
  onTriggerChallenge,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="absolute top-16 left-4 right-4 z-40 select-none shadow-[0_8px_30px_rgba(245,158,11,0.25)] rounded-2xl bg-gradient-to-br from-[#451a03]/95 via-[#291102]/95 to-black/90 border border-amber-400/80 ring-2 ring-amber-400/20 backdrop-blur-xl text-amber-50 p-3.5"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Doubtful Identity Warning
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 font-mono">
                  {syntheticRisk.toFixed(0)}% Anomaly
                </span>
              </div>
              <p className="text-[10px] text-amber-200/80">
                Acoustic & visual jitter detected for <strong className="text-white">{callerName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-amber-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title={isExpanded ? 'Collapse Alert' : 'Expand Alert'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Diagnostic Telemetry Body */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-2.5 border-t border-amber-400/20 space-y-2.5 overflow-hidden"
            >
              {/* Dual Telemetry Meters: Audio Synthetic Risk & Video Visual Integrity */}
              <div className="grid grid-cols-2 gap-2">
                {/* Audio Telemetry */}
                <div className="bg-black/40 rounded-xl p-2 border border-amber-500/20 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] text-amber-200">
                    <span className="flex items-center gap-1 font-semibold">
                      <Volume2 className="w-3 h-3 text-amber-400" />
                      <span>Audio Synthetic Risk</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300">{vocoderDiscontinuity}%</span>
                  </div>
                  <div className="w-full bg-amber-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${vocoderDiscontinuity}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-amber-300/70 font-mono">Phase flux at 3.4kHz</span>
                </div>

                {/* Video Telemetry */}
                <div className="bg-black/40 rounded-xl p-2 border border-amber-500/20 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] text-amber-200">
                    <span className="flex items-center gap-1 font-semibold">
                      <Video className="w-3 h-3 text-amber-400" />
                      <span>Visual Sync Offset</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300">+{lipSyncDesyncMs}ms</span>
                  </div>
                  <div className="w-full bg-amber-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-rose-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (lipSyncDesyncMs / 200) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-amber-300/70 font-mono">Viseme/phoneme delta</span>
                </div>
              </div>

              {/* Recommended Challenge Verification Prompt */}
              <div className="bg-amber-950/70 border border-amber-400/30 rounded-xl p-2.5 flex items-start gap-2">
                <Fingerprint className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div className="text-[10px] leading-relaxed">
                  <strong className="text-amber-200 block mb-0.5">Recommended Countermeasure:</strong>
                  <span className="text-amber-100/90">{verificationChallenge}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {onTriggerChallenge && (
                  <button
                    onClick={onTriggerChallenge}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-md active:scale-95"
                  >
                    <span>Prompt Caller Passphrase</span>
                  </button>
                )}
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="py-1.5 px-3 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-400/30 text-amber-200 text-[10px] font-semibold transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
export default RiskAlertCard;
