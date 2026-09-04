import React, { useState } from 'react';
import { useTrustLine } from '../context/TrustLineContext';
import { CallRecord, CallTier } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  PhoneCall,
  ChevronRight,
} from 'lucide-react';

export const CallHistoryList: React.FC<{ maxItems?: number; showHeader?: boolean }> = ({
  maxItems,
  showHeader = true,
}) => {
  const { callRecords, savedScans, setThreatModalCall, setActiveScanResult, setIsQuickScanOpen } = useTrustLine();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | CallTier>('All');
  const [viewMode, setViewMode] = useState<'calls' | 'scans'>('calls');

  // Filter calls
  const filteredCalls = callRecords
    .filter((call) => {
      const matchesSearch =
        call.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.callerNumber.includes(searchQuery) ||
        call.platform.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = selectedFilter === 'All' || call.tier === selectedFilter;
      return matchesSearch && matchesTier;
    })
    .slice(0, maxItems || callRecords.length);

  // Filter scans
  const filteredScans = savedScans
    .filter((scan) => {
      const matchesSearch = scan.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = selectedFilter === 'All' || scan.tier === selectedFilter;
      return matchesSearch && matchesTier;
    })
    .slice(0, maxItems || savedScans.length);

  const getTierBadge = (tier: CallTier, score: number) => {
    switch (tier) {
      case 'Trustable':
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>Trustable</span>
          </div>
        );
      case 'Doubt':
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>Doubt ({score.toFixed(0)}%)</span>
          </div>
        );
      case 'Fake':
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold uppercase tracking-wider">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span>Fake ({score.toFixed(0)}%)</span>
          </div>
        );
    }
  };

  const getPlatformIconColor = (platform: string) => {
    switch (platform) {
      case 'WhatsApp':
        return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'Google Meet':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'Zoom':
        return 'text-sky-700 bg-sky-100 border-sky-200';
      case 'Telegram':
        return 'text-indigo-700 bg-indigo-100 border-indigo-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {showHeader && (
        <motion.div layout="position" className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1d1b20] tracking-tight">Recent Threat Scans</h3>
            <p className="text-xs text-[#49454f]">History of calls and scanned files</p>
          </div>
          <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('calls')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'calls' ? 'bg-white shadow-sm text-[#1d1b20]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Calls
            </button>
            <button
              onClick={() => setViewMode('scans')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'scans' ? 'bg-white shadow-sm text-[#1d1b20]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Files
            </button>
          </div>
        </motion.div>
      )}

      {/* Search and Filters Bar */}
      <motion.div layout="position" className="flex flex-col gap-2">
        <div className="relative">
          <Search className="w-4 h-4 text-[#79747e] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-calls"
            type="text"
            placeholder="Search caller name, number, or app..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2.5 rounded-2xl bg-white text-xs text-[#1d1b20] placeholder-[#79747e] border border-[#e6e1e5] focus:border-[#6750a4] focus:ring-4 focus:ring-[#6750a4]/10 transition-all outline-none shadow-sm"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs select-none relative">
          {(['All', 'Trustable', 'Doubt', 'Fake'] as const).map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`relative px-4 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                  isSelected ? 'text-white' : 'text-[#49454f] bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-filter-chip"
                    className="absolute inset-0 bg-[#1d1b20] rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {filter === 'All' ? 'All Calls' : filter === 'Trustable' ? '🟢 Safe' : filter === 'Doubt' ? '🟡 Doubt' : '🔴 Fake'}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Call History Recycler List */}
      <motion.div layout className="flex flex-col gap-3 mt-1">
        <AnimatePresence mode="popLayout">
          {viewMode === 'calls' ? (
            filteredCalls.length === 0 ? (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-8 text-center bg-white rounded-3xl text-[#49454f] flex flex-col items-center justify-center border border-gray-100 shadow-sm"
              >
                <PhoneCall className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-sm font-bold text-[#1d1b20]">No call records found</p>
                <p className="text-xs mt-1 text-gray-500">Your protected calls will appear here.</p>
              </motion.div>
            ) : (
              filteredCalls.map((call, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={call.id}
                  onClick={() => setThreatModalCall(call)}
                  className="group relative bg-white hover:bg-gray-50 p-4 rounded-[1.5rem] border border-gray-200 hover:border-gray-300 transition-all cursor-pointer shadow-[0_2px_10px_rgb(0,0,0,0.02)] active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative">
                        <img
                          src={call.avatarUrl}
                          alt={call.callerName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-[14px] object-cover border border-gray-100 shadow-sm"
                        />
                        <span className={`absolute -bottom-1.5 -right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm border ${getPlatformIconColor(call.platform)}`}>
                          {call.platform === 'Google Meet' ? 'Meet' : call.platform}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-[#1d1b20] truncate">{call.callerName}</h4>
                          {call.isBlocked && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                              Blocked
                            </span>
                          )}
                          {call.isAllowlisted && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                              Safe List
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">{call.callerNumber}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1.5">
                          <span>{call.timestamp}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{call.durationSec}s</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{call.chunksAnalyzed} chunks</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between h-full gap-2 shrink-0">
                      {getTierBadge(call.tier, call.syntheticScore)}
                      <div className="flex items-center text-[10px] text-indigo-500 font-bold group-hover:translate-x-1 transition-transform">
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-[11px]">
                    <p className="text-gray-500 italic truncate flex-1">
                      "{call.transcriptSnippet}"
                    </p>
                    <div className="flex items-end gap-[2px] h-4 shrink-0">
                      {call.audioWaveform.slice(0, 10).map((amp, idx) => (
                        <motion.div
                          initial={{ height: 4 }}
                          animate={{ height: `${Math.max(20, amp)}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.02 }}
                          key={idx}
                          className={`w-1 rounded-full opacity-80 ${call.tier === 'Fake' ? 'bg-rose-500' : call.tier === 'Doubt' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            )
          ) : (
            filteredScans.length === 0 ? (
              <motion.div 
                key="empty-state-scans"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-8 text-center bg-white rounded-3xl text-[#49454f] flex flex-col items-center justify-center border border-gray-100 shadow-sm"
              >
                <AlertTriangle className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-sm font-bold text-[#1d1b20]">No scanned files found</p>
                <p className="text-xs mt-1 text-gray-500">Run a quick scan on media files to see them here.</p>
              </motion.div>
            ) : (
              filteredScans.map((scan, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={scan.id}
                  onClick={() => {
                    setActiveScanResult(scan);
                    setIsQuickScanOpen(true);
                  }}
                  className="group relative bg-white hover:bg-gray-50 p-4 rounded-[1.5rem] border border-gray-200 hover:border-gray-300 transition-all cursor-pointer shadow-[0_2px_10px_rgb(0,0,0,0.02)] active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-[#1d1b20] truncate">{scan.fileName}</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">{scan.mimeType} • {scan.fileSize}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1.5">
                        <span>{new Date(scan.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between h-full gap-2 shrink-0">
                      {getTierBadge(scan.tier, scan.syntheticProbability)}
                      <div className="flex items-center text-[10px] text-indigo-500 font-bold group-hover:translate-x-1 transition-transform">
                        <span>View Report</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-[11px]">
                    <p className="text-[#1d1b20] font-medium">{scan.verdict}</p>
                  </div>
                </motion.div>
              ))
            )
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

