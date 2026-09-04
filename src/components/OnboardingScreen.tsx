import React, { useState } from 'react';
import { useTrustLine } from '../context/TrustLineContext';
import {
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Volume2,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { settings, grantPermission, completeOnboarding, showToast } = useTrustLine();
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [agreedPrivacy, setAgreedPrivacy] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<'welcome' | 'permissions'>('welcome');

  const perms = settings.permissionsGranted;

  const handleFinish = () => {
    if (!agreedTerms || !agreedPrivacy) {
      showToast('Please accept the Terms of Service & Privacy Policy');
      return;
    }
    completeOnboarding();
  };

  return (
    <div className="flex-1 bg-[#fef7ff] text-[#1d1b20] flex flex-col justify-between p-6 select-none animate-in fade-in duration-200 font-sans">
      {currentStep === 'welcome' ? (
        /* Step 1: Welcome & Value Prop */
        <div className="flex flex-col justify-between flex-1 py-4">
          <div className="flex flex-col items-center text-center my-auto">
            <div className="w-20 h-20 rounded-3xl bg-[#6750a4] text-white flex items-center justify-center shadow-xl mb-6 ring-8 ring-[#e8def8]/70">
              <ShieldCheck className="w-11 h-11 text-white" />
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8def8] text-[#1d192b] text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#6750a4]" />
              <span>Material 3 Deepfake Shield</span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-[#1d1b20]">
              TrustLine Security
            </h2>
            <p className="text-xs text-[#49454f] max-w-xs mt-2 leading-relaxed">
              Real-time protection against AI voice clones, CEO impersonation, and synthetic audio tampering across WhatsApp, Google Meet, and Zoom calls.
            </p>

            {/* 3-Tier explanation preview */}
            <div className="mt-6 w-full max-w-xs grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
              <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                <span>🟢 Trustable</span>
                <p className="text-[9px] font-normal text-emerald-700 mt-0.5">Safe Human</p>
              </div>
              <div className="p-2 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200">
                <span>🟡 Doubt</span>
                <p className="text-[9px] font-normal text-amber-700 mt-0.5">Compression</p>
              </div>
              <div className="p-2 rounded-2xl bg-rose-50 text-rose-900 border border-rose-200">
                <span>🔴 Fake</span>
                <p className="text-[9px] font-normal text-rose-700 mt-0.5">AI Voice Clone</p>
              </div>
            </div>
          </div>

          {/* Mandatory Checkboxes */}
          <div className="mt-6 flex flex-col gap-2.5 pt-4 border-t border-[#e6e1e5]">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#49454f]">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded text-[#6750a4] focus:ring-[#6750a4]"
              />
              <span>
                I agree to the <strong className="text-[#1d1b20]">Terms of Service</strong> for VoIP call protection.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#49454f]">
              <input
                type="checkbox"
                checked={agreedPrivacy}
                onChange={(e) => setAgreedPrivacy(e.target.checked)}
                className="mt-0.5 rounded text-[#6750a4] focus:ring-[#6750a4]"
              />
              <span>
                I acknowledge the <strong className="text-[#1d1b20]">Zero-Audio-Retention Privacy Policy</strong> (RAM-only 7s buffers).
              </span>
            </label>

            <button
              id="btn-onboarding-next"
              onClick={() => {
                if (!agreedTerms || !agreedPrivacy) {
                  showToast('Please accept the Terms & Privacy checkboxes');
                  return;
                }
                setCurrentStep('permissions');
              }}
              className="mt-2 w-full py-3.5 px-4 rounded-2xl bg-[#6750a4] hover:bg-[#563f91] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <span>Continue to Permissions Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Step 2: Permissions Setup Guide */
        <div className="flex flex-col justify-between flex-1 py-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#e8def8] text-[#1d192b]">
                Step 2 of 2
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#1d1b20]">
              Android System Permissions
            </h2>
            <p className="text-xs text-[#49454f] mt-1">
              TrustLine requires 4 standard Android system permissions to monitor VoIP calls and display floating safety HUDs.
            </p>

            {/* Permission Cards */}
            <div className="flex flex-col gap-2.5 mt-4">
              {/* 1. Foreground Service */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#e6e1e5] shadow-xs flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-[#1d9c5b]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1d1b20]">Foreground Service</h4>
                    <p className="text-[11px] text-[#49454f]">Maintains 24/7 background VoIP detection</p>
                  </div>
                </div>
                <button
                  id="btn-perm-foreground"
                  onClick={() => grantPermission('foregroundService')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    perms.foregroundService
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#6750a4] text-white'
                  }`}
                >
                  {perms.foregroundService ? 'Granted ✓' : 'Grant'}
                </button>
              </div>

              {/* 2. Accessibility / Caller ID */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#e6e1e5] shadow-xs flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1d1b20]">Accessibility API</h4>
                    <p className="text-[11px] text-[#49454f]">Detects incoming WhatsApp/Zoom caller IDs</p>
                  </div>
                </div>
                <button
                  id="btn-perm-accessibility"
                  onClick={() => grantPermission('accessibility')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    perms.accessibility
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#6750a4] text-white'
                  }`}
                >
                  {perms.accessibility ? 'Granted ✓' : 'Grant'}
                </button>
              </div>

              {/* 3. Audio Loopback Screener */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#e6e1e5] shadow-xs flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-[#6750a4]">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1d1b20]">Audio Stream Capture</h4>
                    <p className="text-[11px] text-[#49454f]">Performs rolling 7-second on-device VAD</p>
                  </div>
                </div>
                <button
                  id="btn-perm-audio"
                  onClick={() => grantPermission('audioCapture')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    perms.audioCapture
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#6750a4] text-white'
                  }`}
                >
                  {perms.audioCapture ? 'Granted ✓' : 'Grant'}
                </button>
              </div>

              {/* 4. Display Overlay / HUD */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#e6e1e5] shadow-xs flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1d1b20]">Overlay (Picture-in-Picture)</h4>
                    <p className="text-[11px] text-[#49454f]">Displays Floating HUD pill over active calls</p>
                  </div>
                </div>
                <button
                  id="btn-perm-overlay"
                  onClick={() => grantPermission('overlayPermission')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    perms.overlayPermission
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#6750a4] text-white'
                  }`}
                >
                  {perms.overlayPermission ? 'Granted ✓' : 'Grant'}
                </button>
              </div>
            </div>
          </div>

          {/* Activate Shield Action */}
          <div className="pt-4 border-t border-[#e6e1e5]">
            <button
              id="btn-complete-onboarding"
              onClick={handleFinish}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#6750a4] hover:bg-[#563f91] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <ShieldCheck className="w-5 h-5 text-white" />
              <span>Activate TrustLine Protection</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

