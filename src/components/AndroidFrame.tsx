import React, { useState, useEffect } from 'react';
import { useTrustLine } from '../context/TrustLineContext';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';

export const AndroidFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { deviceFrameMode, setDeviceFrameMode } = useTrustLine();
  const [time, setTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!deviceFrameMode) {
    // Full width web preview mode
    return (
      <div className="min-h-screen bg-[#f7f2fa] text-[#1d1b20] flex flex-col font-sans">
        {/* Top bar control to switch to phone frame */}
        <div className="bg-[#f3edf7] border-b border-[#e6e1e5] px-5 py-2 flex items-center justify-between text-xs text-[#49454f]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1d9c5b] animate-pulse"></span>
            <span className="font-bold text-[#6750a4]">TrustLine Android Engine 3.4 (High Density M3)</span>
          </div>
          <button
            id="btn-toggle-frame-mode"
            onClick={() => setDeviceFrameMode(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8def8] text-[#1d192b] font-bold hover:bg-[#d9cceb] transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#6750a4]" />
            <span>Switch to Android Frame View</span>
          </button>
        </div>
        <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-2 sm:p-6 antialiased font-sans">
      {/* View Switcher Header Bar */}
      <div className="w-full max-w-[430px] mb-3 flex items-center justify-between text-xs text-slate-300 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#6750a4]"></div>
          <span className="font-semibold tracking-wide">Android 15 (Material You - High Density)</span>
        </div>
        <button
          id="btn-toggle-fullscreen-mode"
          onClick={() => setDeviceFrameMode(false)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          title="Switch to full screen layout"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Width</span>
        </button>
      </div>

      {/* Realistic Android Phone Mockup Frame */}
      <div className="relative w-full max-w-[410px] h-[860px] max-h-[92vh] bg-black rounded-[48px] p-3 shadow-2xl ring-1 ring-white/20 border-4 border-[#334155] flex flex-col overflow-hidden">
        {/* Inner Screen Bezel */}
        <div className="relative flex-1 bg-[#fef7ff] text-[#1d1b20] rounded-[38px] overflow-hidden flex flex-col select-none">
          
          {/* Android Status Bar */}
          <div className="h-10 bg-transparent flex items-center justify-between px-6 pt-1 text-xs font-semibold tracking-tight text-[#1d1b20] z-30 select-none">
            {/* Clock */}
            <span className="font-mono text-[13px] font-bold text-[#1d1b20]">{time}</span>

            {/* Camera Punch-hole Cutout */}
            <div className="w-4 h-4 rounded-full bg-black ring-2 ring-black/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1e293b]/80"></div>
            </div>

            {/* Android Status Icons */}
            <div className="flex items-center gap-1.5 text-[#1d1b20]">
              <span className="text-[10px] font-bold tracking-wider px-1 py-0.2 rounded bg-[#e8def8] text-[#1d192b]">5G</span>
              <Signal className="w-3.5 h-3.5 text-[#1d1b20]" />
              <Wifi className="w-3.5 h-3.5 text-[#1d1b20]" />
              <div className="flex items-center gap-0.5 font-mono text-[11px] font-bold">
                <span>94%</span>
                <BatteryMedium className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Screen Body */}
          <div className="flex-1 overflow-y-auto relative flex flex-col bg-[#fef7ff]">
            {children}
          </div>

          {/* Android 15 Gesture Navigation Bar Pill */}
          <div className="h-4 bg-[#f3edf7] flex items-center justify-center z-30">
            <div className="w-32 h-1 bg-[#1d1b20]/30 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

