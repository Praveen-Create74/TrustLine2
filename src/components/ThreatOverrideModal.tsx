import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, PhoneOff, UserX, AlertOctagon, Lock, EyeOff, VolumeX, ShieldCheck } from 'lucide-react';

export interface ThreatOverrideModalProps {
  isOpen: boolean;
  callerName?: string;
  callerNumber?: string;
  syntheticRisk: number; // e.g. 98%
  cloneEngine?: string; // e.g. 'ElevenLabs v3 Multilingual'
  triggerPhrases?: string[]; // e.g. ['Urgent wire transfer', 'Secret one-time code']
  onEmergencyDisconnect: () => void;
  onBlockAndReport: () => void;
  onBypassOverride?: () => void;
}

export const ThreatOverrideModal: React.FC<ThreatOverrideModalProps> = ({
  isOpen,
  callerName = 'Suspected Impersonator',
  callerNumber = '+1 (800) 555-0199',
  syntheticRisk = 97.4,
  cloneEngine = 'ElevenLabs Neural TTS v3 (Matched)',
  triggerPhrases = ['Urgent wire transfer', 'Do not tell anyone', 'Immediate cash deposit'],
  onEmergencyDisconnect,
  onBlockAndReport,
  onBypassOverride,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative w-full max-w-sm rounded-3xl bg-red-950/40 border border-red-500/40 shadow-2xl text-white p-6 flex flex-col items-center text-center gap-4 select-none overflow-hidden"
        >
          {/* Top Threat Badge */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 shadow-xl"
          >
            <ShieldAlert className="w-8 h-8" />
          </motion.div>

          <div>
            <h2 className="text-lg font-bold tracking-wide text-red-400">
              EMERGENCY: DEEPFAKE ISOLATION
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Synthetic voice clone active for <strong className="text-white">{callerName}</strong>. Video feed frozen and audio muted automatically.
            </p>
          </div>

          {/* Critical Indicators Box */}
          <div className="w-full bg-slate-950/50 rounded-2xl p-3 border border-red-500/20 flex flex-col gap-2 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">AI Confidence:</span>
              <span className="font-mono font-black text-red-400 text-sm">
                {syntheticRisk.toFixed(1)}% Synthetic
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Identified Model:</span>
              <span className="font-mono text-white text-[11px] font-semibold">
                {cloneEngine}
              </span>
            </div>

            {/* Semantic Scam Triggers */}
            {triggerPhrases.length > 0 && (
              <div className="pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Detected Fraud Triggers:
                </span>
                <div className="flex flex-wrap gap-1">
                  {triggerPhrases.map((phrase, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-red-950/60 border border-red-500/30 text-red-200 text-[9px] font-mono"
                    >
                      ⚠️ "{phrase}"
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Emergency Actions */}
          <div className="w-full flex flex-col gap-2.5 mt-2">
            <button
              onClick={onEmergencyDisconnect}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Emergency Disconnect Now</span>
            </button>

            <button
              onClick={onBlockAndReport}
              className="w-full py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Lock className="w-4 h-4 text-red-400" />
              <span>Block Caller & Report Threat</span>
            </button>

            {onBypassOverride && (
              <button
                onClick={onBypassOverride}
                className="text-[10px] text-red-400/80 hover:text-red-400 underline pt-1 transition-colors"
              >
                Bypass override (Inspect feed anyway)
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default ThreatOverrideModal;
