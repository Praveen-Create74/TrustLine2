import React from 'react';
import { useTrustLine } from '../context/TrustLineContext';
import { ShieldCheck, ShieldAlert, Zap, Activity, FileAudio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HeroProtectionCard: React.FC = () => {
  const { settings, updateSettings, threatStats, setIsQuickScanOpen } = useTrustLine();

  return (
    <div className="flex flex-col gap-4">
      {/* 21st.dev Style Video + Glassmorphic Hero Container */}
      <motion.div 
        layout
        className="relative bg-black rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgb(0,0,0,0.12)] border border-white/10 flex flex-col min-h-[360px]"
      >
        {/* Abstract Tech Video Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen scale-105"
            src="https://assets.mixkit.co/videos/preview/mixkit-data-particles-flowing-in-a-network-loop-518-large.mp4"
          />
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#0a0a0c]" />
        </div>

        {/* Content Layer (Glassmorphic) */}
        <div className="relative z-10 p-5 flex flex-col h-full justify-between flex-1 text-white">
          
          {/* Header row */}
          <div className="flex justify-between items-start">
            <motion.div layout="position">
              <h2 className="text-base font-bold tracking-tight text-white/90">Active Protection</h2>
              <p className="text-xs text-white/60">Real-time VoIP deepfake interception</p>
            </motion.div>
            
            <motion.div layout="position" className="flex items-center gap-2">
              <span
                className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-md border ${
                  settings.protectionEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {settings.protectionEnabled ? 'Monitoring' : 'Paused'}
              </span>
              
              {/* Sleek Toggle Switch */}
              <button
                onClick={() => updateSettings({ protectionEnabled: !settings.protectionEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 focus:outline-none backdrop-blur-sm border ${
                  settings.protectionEnabled ? 'bg-indigo-500/80 border-indigo-500' : 'bg-white/10 border-white/20'
                }`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`w-5 h-5 rounded-full bg-white shadow-sm ${
                    settings.protectionEnabled ? 'ml-6' : 'ml-0'
                  }`}
                />
              </button>
            </motion.div>
          </div>

          {/* Center Animated Shield Graphic */}
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className="relative w-28 h-28 flex items-center justify-center mb-4">
              <AnimatePresence>
                {settings.protectionEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-indigo-500 rounded-full" 
                    />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-[1px] border-indigo-400/30 border-dashed rounded-full" 
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                layout
                className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border ${
                  settings.protectionEnabled ? 'bg-indigo-500/20 border-indigo-400/30' : 'bg-white/5 border-white/10'
                }`}
              >
                {settings.protectionEnabled ? (
                  <ShieldCheck className="w-8 h-8 text-indigo-300 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-white/40" />
                )}
              </motion.div>
            </div>
            
            <motion.p layout="position" className="text-xl font-bold tracking-tight mb-1 text-white/90">
              {settings.protectionEnabled ? 'Shield Active' : 'Shield Inactive'}
            </motion.p>
            <motion.p layout="position" className="text-white/50 text-xs max-w-[200px] leading-relaxed">
              {settings.protectionEnabled
                ? 'Watching audio channels for synthetic signatures'
                : 'Call protection is disabled. Tap switch to activate.'}
            </motion.p>
          </div>

          {/* High Density Metric Cards (Glassmorphic) */}
          <motion.div layout="position" className="grid grid-cols-3 gap-2 mt-auto">
            <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] text-white/50 mb-1 uppercase font-bold tracking-wider">Latency</p>
              <p className="text-sm font-mono font-bold text-indigo-300">{settings.protectionEnabled ? '~42ms' : '--'}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] text-white/50 mb-1 uppercase font-bold tracking-wider">Blocked</p>
              <p className="text-sm font-mono font-bold text-rose-400">{threatStats.fakeBlockedCount}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] text-white/50 mb-1 uppercase font-bold tracking-wider">Safe Calls</p>
              <p className="text-sm font-mono font-bold text-emerald-400">{threatStats.safeCount}</p>
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Quick Action Buttons */}
      <motion.div layout className="grid grid-cols-1">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsQuickScanOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white border border-[#e6e1e5] shadow-[0_2px_10px_rgb(0,0,0,0.02)] text-[#1d1b20] font-bold text-sm transition-colors hover:bg-gray-50"
        >
          <FileAudio className="w-5 h-5 text-[#6750a4]" />
          <span>Quick Scan</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

