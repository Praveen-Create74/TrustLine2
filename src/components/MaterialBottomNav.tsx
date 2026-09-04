import React from 'react';
import { useTrustLine } from '../context/TrustLineContext';
import { LayoutDashboard, History, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export const MaterialBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, threatStats } = useTrustLine();

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Home',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'scans' as const,
      label: 'History',
      icon: History,
      badge: threatStats.fakeBlockedCount > 0 ? `${threatStats.fakeBlockedCount}` : null,
      badgeColor: 'bg-[#b91c1c] text-white',
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl p-1.5 flex items-center gap-1 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative px-5 py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 group transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-[#6750a4]/10 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'scale-110 text-[#6750a4]' : 'text-[#49454f] group-hover:text-[#1d1b20]'
                  }`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white shadow-sm ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              
              <span className={`text-[9px] font-bold tracking-wide transition-colors ${
                isActive ? 'text-[#6750a4]' : 'text-[#49454f]'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};


