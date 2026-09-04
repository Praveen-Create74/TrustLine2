import React, { useState } from 'react';
import { useTrustLine } from '../context/TrustLineContext';
import { playSystemChime } from '../utils/audioSynth';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sliders,
  Bell,
  UserCheck,
  Plus,
  Trash2,
  Volume2,
  Lock,
  LogOut,
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, removeFromAllowlist, allowlistCaller, showToast } = useTrustLine();
  const { user, signOut } = useAuth();

  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactNumber, setNewContactNumber] = useState<string>('');
  const [showAddContact, setShowAddContact] = useState<boolean>(false);

  const handleAddAllowlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactNumber) {
      showToast('Please enter both name and number');
      return;
    }
    allowlistCaller(newContactName, newContactNumber);
    setNewContactName('');
    setNewContactNumber('');
    setShowAddContact(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="mb-2">
        <h3 className="text-xl font-bold text-[#1d1b20] tracking-tight">System Configuration</h3>
        <p className="text-sm text-[#49454f]">Manage detection engine and preferences</p>
      </motion.div>

      {/* 1. Engine Sensitivity */}
      <motion.div layout className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-indigo-600" />
            </div>
            <h4 className="text-sm font-bold text-[#1d1b20] tracking-tight">
              Detection Sensitivity
            </h4>
          </div>
        </div>

        <p className="text-[11px] text-[#49454f] z-10">
          Adjusts how strictly the app scans for AI voice cloning. "Medium" is recommended for daily use.
        </p>

        {/* 3-Step Sensitivity Toggle with Framer Motion Layout Pill */}
        <div className="relative flex bg-gray-50 p-1.5 rounded-2xl z-10 border border-gray-100">
          {(['low', 'medium', 'high'] as const).map((level) => {
            const isSelected = settings.sensitivity === level;
            return (
              <button
                key={level}
                onClick={() => updateSettings({ sensitivity: level })}
                className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-colors z-20 ${
                  isSelected ? 'text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="sensitivity-pill"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-sm -z-10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                {level}
              </button>
            );
          })}
        </div>

        <motion.div layout className="text-[10px] text-gray-400 px-2 font-medium z-10">
          <AnimatePresence mode="wait">
            <motion.span
              key={settings.sensitivity}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="block"
            >
              {settings.sensitivity === 'low' && 'Low: Only flags obvious AI voices. Saves battery.'}
              {settings.sensitivity === 'medium' && 'Medium: Best balance. Flags most AI clones accurately.'}
              {settings.sensitivity === 'high' && 'High: Maximum security. May occasionally flag poor network connections as threats.'}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* 2. Alert & Chime Customization */}
      <motion.div layout className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="text-sm font-bold text-[#1d1b20] tracking-tight">
              Alerts & Notifications
            </h4>
          </div>
        </div>

        {/* Audio Warning Chime Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-gray-50 mt-1">
          <div>
            <span className="text-sm font-bold text-[#1d1b20]">Audio Warning Chime</span>
            <p className="text-[11px] text-[#49454f] mt-0.5">Play urgent audible tone when flagged</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playSystemChime('alert')}
              className="p-2 rounded-xl bg-gray-50 text-indigo-600 hover:bg-gray-100"
              title="Test Warning Chime"
            >
              <Volume2 className="w-4 h-4" />
            </motion.button>
            <button
              onClick={() => updateSettings({ warningChimeEnabled: !settings.warningChimeEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border ${
                settings.warningChimeEnabled ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-5 h-5 rounded-full bg-white shadow-sm ${
                  settings.warningChimeEnabled ? 'ml-6' : 'ml-0'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3. Contact Allowlist Management */}
      <motion.div layout className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1d1b20] tracking-tight">
                Trusted Allowlist
              </h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Skip scanning trusted contacts</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddContact(!showAddContact)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-[#1d192b] hover:bg-gray-200 transition-colors"
          >
            <Plus className={`w-4 h-4 transition-transform duration-300 ${showAddContact ? 'rotate-45' : ''}`} />
          </motion.button>
        </div>

        {/* Add Contact Form */}
        <AnimatePresence>
          {showAddContact && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
              onSubmit={handleAddAllowlist} 
            >
              <div className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-3 border border-gray-100 mt-2 mb-2">
                <Input
                  type="text"
                  placeholder="Contact Name (e.g. Grandma)"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="bg-white"
                />
                <Input
                  type="text"
                  placeholder="Phone Number (e.g. +1-555-0199)"
                  value={newContactNumber}
                  onChange={(e) => setNewContactNumber(e.target.value)}
                  className="bg-white"
                />
                <div className="flex justify-end gap-2 mt-1">
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                  >
                    Save Contact
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Allowlist Items */}
        <div className="flex flex-col gap-2 mt-1">
          <AnimatePresence mode="popLayout">
            {settings.contactAllowlist.length === 0 ? (
              <motion.p 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-gray-400 italic py-2 text-center"
              >
                No contacts on the allowlist yet.
              </motion.p>
            ) : (
              settings.contactAllowlist.map((contact) => (
                <motion.div
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
                >
                  <div>
                    <h5 className="font-bold text-[#1d1b20] text-xs">{contact.name}</h5>
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5">{contact.number}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFromAllowlist(contact.id)}
                    className="p-2 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 4. Privacy Guarantee */}
      <motion.div layout className="bg-gray-50 rounded-[2rem] p-5 border border-gray-100 text-xs flex flex-col gap-2">
        <div className="flex items-center gap-2 font-bold text-gray-600">
          <Lock className="w-4 h-4 text-indigo-500" />
          <span>Privacy Guarantee</span>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
          We never save or listen to your calls. Audio is analyzed instantly on your device via dual-tier hardware-accelerated VAD and completely deleted immediately.
        </p>
      </motion.div>

      {/* 5. Account Management */}
      <motion.div layout className="flex justify-center pt-2">
        <Button
          variant="outline"
          onClick={signOut}
          className="flex items-center gap-2 px-6 py-5 rounded-2xl border-rose-100 text-rose-600 bg-rose-50 font-bold text-xs hover:bg-rose-100 hover:text-rose-700 transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </motion.div>
    </div>
  );
};
