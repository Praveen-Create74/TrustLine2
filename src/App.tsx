import React, { useState, useEffect } from 'react';
import { TrustLineProvider, useTrustLine } from './context/TrustLineContext';
import { useAuth } from './context/AuthContext';
import { MaterialTopBar } from './components/MaterialTopBar';
import { MaterialBottomNav } from './components/MaterialBottomNav';
import { HeroProtectionCard } from './components/HeroProtectionCard';
import { CallHistoryList } from './components/CallHistoryList';
import { SettingsScreen } from './components/SettingsScreen';
import { FloatingActionHUD } from './components/FloatingActionHUD';
import { PostCallThreatModal } from './components/PostCallThreatModal';
import { QuickScanModal } from './components/QuickScanModal';
import { InteractiveSimDrawer } from './components/InteractiveSimDrawer';
import { OnboardingScreen } from './components/OnboardingScreen';
import { LiveHUD } from './components/LiveHUD';
import { RiskAlertCard } from './components/RiskAlertCard';
import { ThreatOverrideModal } from './components/ThreatOverrideModal';
import { PostCallDashboard } from './components/PostCallDashboard';
import { LoginScreen } from './components/LoginScreen';
import { VoIPCallSimulator } from './components/VoIPCallSimulator';
import { FileAudio, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      key="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex items-center justify-center w-40 h-40 rounded-3xl bg-slate-900 shadow-[0_0_80px_-15px_rgba(56,189,248,0.5)] border border-slate-800"
      >
        <motion.div 
          className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-sky-500/20 to-purple-500/20"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]">
          <defs>
            <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 15 25 L 45 25 L 45 35 L 35 35 L 35 75 L 25 75 L 25 35 L 15 35 Z"
            fill="url(#splashGradient)"
            initial={{ pathLength: 0, fillOpacity: 0 }}
            animate={{ pathLength: 1, fillOpacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          <motion.path
            d="M 50 25 L 75 25 C 85 25 90 30 90 40 C 90 48 85 53 75 55 L 60 55 L 60 75 L 50 75 Z M 60 35 L 60 45 L 75 45 C 78 45 80 43 80 40 C 80 37 78 35 75 35 Z"
            fill="url(#splashGradient)"
            initial={{ pathLength: 0, fillOpacity: 0 }}
            animate={{ pathLength: 1, fillOpacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.path
            d="M 70 55 L 90 75 L 75 75 L 60 55 Z"
            fill="url(#splashGradient)"
            initial={{ pathLength: 0, fillOpacity: 0 }}
            animate={{ pathLength: 1, fillOpacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut", delay: 0.8 }}
          />
        </svg>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mt-8 text-center"
      >
        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
          TrustLine
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1 tracking-widest uppercase">
          Neural Defense
        </p>
      </motion.div>

      {/* Futuristic scanning line */}
      <motion.div
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{ duration: 2, ease: "linear", repeat: Infinity }}
        className="absolute left-0 right-0 h-0.5 bg-sky-400/50 shadow-[0_0_20px_2px_rgba(56,189,248,0.7)] z-10"
      />
    </motion.div>
  );
};

const MainScreenContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    settings,
    activeCall,
    setIsQuickScanOpen,
    toastMessage,
    hangUpCall,
    blockCaller,
    reportToCommunity,
    showToast,
    threatModalCall,
    setThreatModalCall,
    analyzeFile,
  } = useTrustLine();


  const [isHudMinimised, setIsHudMinimised] = useState<boolean>(false);
  const [isRiskAlertDismissed, setIsRiskAlertDismissed] = useState<boolean>(false);
  const [isThreatOverrideBypassed, setIsThreatOverrideBypassed] = useState<boolean>(false);
  const [isPostCallDashboardOpen, setIsPostCallDashboardOpen] = useState<boolean>(false);

  const handleExportAudit = async (reportToExport: any) => {
    if (!reportToExport) return;
    try {
      showToast('Generating signed audit packet...');
      const res = await fetch('/api/forensics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: reportToExport })
      });
      const data = await res.json();
      if (data.success && data.auditPacket) {
        const blob = new Blob([JSON.stringify(data.auditPacket, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TrustLine_Audit_${reportToExport.id || 'export'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Audit packet downloaded securely.');
      } else {
        showToast('Failed to generate audit packet.');
      }
    } catch (err) {
      showToast('Error exporting report.');
    }
  };

  // If user hasn't completed setup, show onboarding
  if (!settings.hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  // Derive system status state for locked UI decisions:
  // CONNECTING | ACTIVE | DOUBTFUL | FAKE | ENDED
  const currentStatus = activeCall
    ? activeCall.isIncoming
      ? 'CONNECTING'
      : activeCall.currentTier === 'Fake'
      ? 'FAKE'
      : activeCall.currentTier === 'Doubt'
      ? 'DOUBTFUL'
      : 'ACTIVE'
    : 'ENDED';

  // If active call is currently active or incoming, prioritize the call simulator screen with overlay layers
  if (activeCall) {
    return (
      <div className="relative flex-1 flex flex-col overflow-hidden bg-[#0f172a]">
        {/* Floating Minimalist Live HUD in top corner */}
        <LiveHUD
          status={currentStatus}
          syntheticRisk={activeCall.syntheticProbability}
          latencyMs={42}
          cpuUsage={activeCall.cpuLoadPercent}
          c2paVerified={activeCall.c2paManifest === 'Valid'}
          platform={activeCall.platform}
          isMinimised={isHudMinimised}
          onToggleMinimise={() => setIsHudMinimised(!isHudMinimised)}
          onExpandDetails={() => {
            if (threatModalCall) setIsPostCallDashboardOpen(true);
            else showToast('Live 7-second chunk accumulator active');
          }}
        />

        {/* Sliding Persistent Amber Risk Alert Card on Doubtful State */}
        <RiskAlertCard
          isVisible={activeCall.currentTier === 'Doubt' && !activeCall.isIncoming && !isRiskAlertDismissed}
          callerName={activeCall.callerName}
          syntheticRisk={activeCall.syntheticProbability}
          vocoderDiscontinuity={Math.round(activeCall.vocoderDiscontinuityIndex || 58)}
          lipSyncDesyncMs={activeCall.videoTelemetry?.lipSyncDesyncMs || 145}
          verificationChallenge={activeCall.verificationPrompt}
          onDismiss={() => setIsRiskAlertDismissed(true)}
          onTriggerChallenge={() => {
            showToast(`Prompting verification challenge to ${activeCall.callerName}`);
          }}
        />

        {/* Critical Red Threat Override Modal on Verified Deepfake Attack */}
        <ThreatOverrideModal
          isOpen={activeCall.currentTier === 'Fake' && !activeCall.isIncoming && !isThreatOverrideBypassed}
          callerName={activeCall.callerName}
          callerNumber={activeCall.callerNumber}
          syntheticRisk={activeCall.syntheticProbability}
          cloneEngine="ElevenLabs Neural TTS v3 (Matched)"
          triggerPhrases={activeCall.semanticTriggers || ['Urgent wire transfer', 'OTP verification code']}
          onEmergencyDisconnect={() => {
            hangUpCall('threat_alert');
          }}
          onBlockAndReport={() => {
            blockCaller(activeCall.callerNumber);
            reportToCommunity(activeCall.callerNumber);
            hangUpCall('auto_protect');
          }}
          onBypassOverride={() => {
            setIsThreatOverrideBypassed(true);
            showToast('Warning: Deepfake override bypassed');
          }}
        />

        {/* Live Call Simulator Stream View */}
        <VoIPCallSimulator />

        {/* Post-Call Forensics Analytics Dashboard Modal */}
        <PostCallDashboard
          isOpen={isPostCallDashboardOpen}
          onClose={() => setIsPostCallDashboardOpen(false)}
          report={threatModalCall}
          onExportPdf={() => handleExportAudit(threatModalCall)}
        />
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col justify-between overflow-hidden bg-[#fafafa]">
      {/* Interactive Simulation Floating Trigger & Drawer */}
      <InteractiveSimDrawer />

      {/* Top App Bar */}
      <MaterialTopBar />

      {/* Main Tab Screen Area */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col gap-4"
            >
              {/* Hero Card */}
              <HeroProtectionCard />

              {/* Recent Scans / Call Log snippet */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Recent Interceptions
                  </h3>
                  <button
                    onClick={() => setActiveTab('scans')}
                    className="text-xs text-[#6750a4] font-bold hover:text-[#563f91] transition-colors flex items-center gap-1"
                  >
                    View All <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
                <CallHistoryList maxItems={3} showHeader={false} />
              </div>
            </motion.div>
          )}

          {activeTab === 'scans' && (
            <motion.div 
              key="scans"
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="w-full"
            >
              <CallHistoryList showHeader={true} />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="w-full"
            >
              <SettingsScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="toast-notification-banner"
          className="absolute top-16 left-4 right-4 z-40 bg-[#1d192b] text-white text-xs py-2.5 px-4 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10 animate-in slide-in-from-top duration-150"
        >
          <CheckCircle2 className="w-4 h-4 text-[#1d9c5b] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <MaterialBottomNav />

      {/* Modals / BottomSheets */}
      <PostCallThreatModal />
      <QuickScanModal />
      
      {/* Expandable Post-Call Analytics Dashboard */}
      <PostCallDashboard
        isOpen={isPostCallDashboardOpen}
        onClose={() => setIsPostCallDashboardOpen(false)}
        report={threatModalCall}
        onExportPdf={() => handleExportAudit(threatModalCall)}
      />
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <TrustLineProvider>
      <div className="min-h-screen w-full flex flex-col bg-[#fafafa] font-sans antialiased overflow-hidden relative">
        <AnimatePresence mode="wait">
          {showSplash ? (
            <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
          ) : (
            <motion.div 
              key="main-app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col"
            >
              <MainScreenContent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TrustLineProvider>
  );
}

