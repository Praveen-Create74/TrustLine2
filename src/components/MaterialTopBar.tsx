import React from 'react';
import { useTrustLine } from '../context/TrustLineContext';
import { ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export const MaterialTopBar: React.FC = () => {
  const { settings, resetAppDemo, startSimulatedCall } = useTrustLine();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="px-6 h-20 bg-white/70 backdrop-blur-xl flex items-center justify-between border-b border-gray-100/50 select-none z-10 sticky top-0 shadow-[0_4px_30px_rgb(0,0,0,0.02)]"
    >
      {/* Left Brand Identity */}
      <div className="flex items-center gap-3">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="relative w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
        >
          <ShieldCheck className="w-6 h-6 text-white drop-shadow-md" strokeWidth={2.5} />
          {/* Pulsing online indicator */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-50"></span>
        </motion.div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">TrustLine</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enterprise</span>
            <div className="px-1.5 py-0.5 bg-indigo-50 rounded-md text-[9px] font-bold text-indigo-600 border border-indigo-100">
              v3.0.0
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls & Health Status */}
      <div className="flex items-center gap-3">
        {/* Placeholder for future real-world actions if needed */}
      </div>
    </motion.header>
  );
};


