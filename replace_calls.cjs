const fs = require('fs');
let code = fs.readFileSync('src/components/CallHistoryList.tsx', 'utf8');

const replacement = `
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
                        <span className={\`absolute -bottom-1.5 -right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm border \${getPlatformIconColor(call.platform)}\`}>
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
                          animate={{ height: \`\${Math.max(20, amp)}%\` }}
                          transition={{ duration: 0.5, delay: idx * 0.02 }}
                          key={idx}
                          className={\`w-1 rounded-full opacity-80 \${call.tier === 'Fake' ? 'bg-rose-500' : call.tier === 'Doubt' ? 'bg-amber-500' : 'bg-emerald-500'}\`}
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
`;

const startIndex = code.indexOf('<AnimatePresence mode="popLayout">');
const endIndex = code.indexOf('</AnimatePresence>') + '</AnimatePresence>'.length;

const newCode = code.slice(0, startIndex) + replacement.trim() + code.slice(endIndex);

fs.writeFileSync('src/components/CallHistoryList.tsx', newCode);
console.log('done');
