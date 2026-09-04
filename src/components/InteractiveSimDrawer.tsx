import React from 'react';
import { useTrustLine } from '../context/TrustLineContext';
import { PRESET_CALL_SCENARIOS } from '../data/mockCalls';
import {
  FlaskConical,
  X,
  PhoneCall,
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Video,
  Radio,
  Cpu,
  Sparkles,
  Zap,
} from 'lucide-react';

export const InteractiveSimDrawer: React.FC = () => {
  const {
    isTestSimDrawerOpen,
    setIsTestSimDrawerOpen,
    startSimulatedCall,
    activeCall,
  } = useTrustLine();

  return (
    <>
      {/* Floating Action Trigger Button (Hidden in Production) */}
      {import.meta.env.DEV && !activeCall && !isTestSimDrawerOpen && (
        <button
          onClick={() => setIsTestSimDrawerOpen(true)}
          className="fixed bottom-28 right-4 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-full shadow-[0_4px_20px_rgb(79,70,229,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center group"
          aria-label="Open Call Simulator"
        >
          <FlaskConical className="w-6 h-6 group-hover:animate-pulse" />
        </button>
      )}

      {/* Slide-over / Modal Simulation Panel */}
      {isTestSimDrawerOpen && (
        <div
          id="simulation-drawer-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTestSimDrawerOpen(false);
          }}
        >
          <div
            id="simulation-drawer-card"
            className="w-full max-w-lg bg-[#fef7ff] text-[#1d1b20] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#e6e1e5] overflow-hidden flex flex-col max-h-[88vh] animate-in slide-in-from-bottom-6 duration-200"
          >
            {/* Header */}
            <div className="p-4 bg-[#e8def8]/70 border-b border-[#cac4d0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-[#6750a4] text-white shadow-sm">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1d1b20]">
                    Interactive Call Simulator
                  </h3>
                  <p className="text-[11px] text-[#49454f]">
                    Select a real-time deepfake VoIP scenario to test live HUD detection
                  </p>
                </div>
              </div>
              <button
                id="btn-close-sim-drawer"
                onClick={() => setIsTestSimDrawerOpen(false)}
                className="p-1.5 rounded-full text-[#49454f] hover:bg-[#cac4d0]/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scenario List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {PRESET_CALL_SCENARIOS.map((scen, idx) => {
                const isFake = scen.expectedTier === 'Fake';
                const isDoubt = scen.expectedTier === 'Doubt';
                const isSafe = scen.expectedTier === 'Trustable';

                return (
                  <div
                    key={scen.id}
                    id={`sim-card-${scen.id}`}
                    onClick={() => startSimulatedCall(scen.id)}
                    className={`group p-3.5 rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
                      isFake
                        ? 'bg-rose-50/60 border-rose-200 hover:border-rose-400 hover:bg-rose-50'
                        : isDoubt
                        ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                        : 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    {/* Top line with tag and letter */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isFake
                              ? 'bg-rose-600 text-white'
                              : isDoubt
                              ? 'bg-amber-600 text-white'
                              : 'bg-emerald-700 text-white'
                          }`}
                        >
                          {(scen as any).scenarioLetter || `Scenario ${idx + 1}`}
                        </span>
                        <span className="text-xs font-extrabold text-[#1d1b20]">
                          {scen.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#49454f]">
                        <span>{scen.platform}</span>
                        {(scen as any).isVideoCall && <Video className="w-3 h-3 text-purple-600" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#49454f] mb-2 leading-relaxed">
                      {scen.subtitle}
                    </p>

                    {/* Meta pill badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#49454f]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/80 border border-[#cac4d0]/60 font-mono">
                        <PhoneCall className="w-3 h-3 text-[#6750a4]" />
                        {scen.callerNumber}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/80 border border-[#cac4d0]/60 font-mono">
                        <Cpu className="w-3 h-3 text-[#49454f]" />
                        {(scen as any).cpuLoadPercent || 2.4}% CPU
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold ${
                          isFake
                            ? 'bg-rose-100 text-rose-800'
                            : isDoubt
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isFake ? (
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                        ) : isDoubt ? (
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        )}
                        <span>{scen.expectedTier} ({scen.syntheticProbability}%)</span>
                      </span>
                    </div>

                    {/* Launch CTA */}
                    <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between">
                      <span className="text-[10px] text-[#49454f] italic truncate max-w-[280px]">
                        "{scen.simulatedSpeech}"
                      </span>
                      <button
                        className="flex items-center gap-1 text-[11px] font-black text-[#6750a4] group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Launch Call</span>
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Notice */}
            <div className="p-3 bg-[#f3edf7] border-t border-[#cac4d0] text-center text-[10px] text-[#49454f] flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#6750a4]" />
              <span>
                Uses on-device WebAudio speech synthesis & DSP Fourier spectral visualizer
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
