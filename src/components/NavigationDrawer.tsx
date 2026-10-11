import React from 'react';
import { TabType, Station, UserPreferences } from '../types';

import { SmartRailLogo } from './SmartRailLogo';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  stations: Station[];
  currentStation: Station;
  onSelectStation: (station: Station) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  currentUser?: UserPreferences;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  stations,
  currentStation,
  onSelectStation,
  isDark = true,
  onToggleTheme,
  currentUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-[#0a0a0a] border-r border-white/15 h-full flex flex-col z-10 shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <SmartRailLogo size="sm" showText={true} />
          <button
            onClick={onClose}
            className="p-1.5 border border-white/15 hover:bg-white hover:text-black text-white/70 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Current Active Station */}
        <div className="my-4 p-4 bg-[#121212] border border-white/15">
          <div className="text-[9px] font-mono font-bold text-[#ff3e00] uppercase tracking-widest mb-1">
            ACTIVE PILOT TERMINAL
          </div>
          <div className="text-sm font-display font-black text-white uppercase truncate">
            {currentStation.name}
          </div>
          <div className="text-[11px] font-mono text-white/50 flex items-center gap-1 mt-0.5 uppercase">
            <span className="material-symbols-outlined text-[13px]">location_on</span>
            {currentStation.location}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-1 mb-6">
          <div className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest px-2 mb-2">
            INDEX NAVIGATION
          </div>
          {[
            { id: 'explore' as TabType, label: 'Master Home Screen', icon: 'home' },
            { id: 'user' as TabType, label: 'Commuter User Page & Pass', icon: 'badge' },
            { id: 'train_search' as TabType, label: 'Where Is My Train?', icon: 'train' },
            { id: 'my_journey' as TabType, label: 'My Journey Flight Deck', icon: 'navigation' },
            { id: 'map' as TabType, label: '3D Station Twin & AR', icon: 'map' },
            { id: 'nearby' as TabType, label: 'Nearby Railway Stations', icon: 'near_me' },
            { id: 'stations' as TabType, label: 'Station Regional Catalog', icon: 'explore' },
            { id: 'assistant' as TabType, label: 'Spatial AI Copilot', icon: 'smart_toy' },
            { id: 'tickets' as TabType, label: 'Live Departures & Passes', icon: 'confirmation_number' },
            { id: 'profile' as TabType, label: 'User Profile & Accessibility', icon: 'account_circle' },
            { id: 'login' as TabType, label: 'Sign In / Switch Account', icon: 'login' },
            ...((currentUser?.email?.toLowerCase() === 'indreshgovindarasu08@gmail.com' || currentUser?.role === 'admin')
              ? [{ id: 'admin' as TabType, label: '★ Admin Control Center (Owner)', icon: 'admin_panel_settings' }]
              : []),
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-left ${
                currentTab === item.id
                  ? 'bg-white text-black border border-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-[#ff3e00] border border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Theme Appearance Control */}
        {onToggleTheme && (
          <div className="pt-3 pb-3 border-t border-white/10">
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-[#141414] border border-white/15 text-xs font-bold uppercase tracking-wider text-white hover:border-[#ff3e00] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-300">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
                <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/10 text-white/80">
                {isDark ? 'NIGHT' : 'DAY'}
              </span>
            </button>
          </div>
        )}

        {/* Switch Station Section */}
        <div className="mt-auto pt-3 border-t border-white/10">
          <div className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest px-2 mb-2">
            SWITCH TERMINAL HUB
          </div>
          <div className="space-y-1.5">
            {stations.map((station) => (
              <button
                key={station.id}
                onClick={() => {
                  onSelectStation(station);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase transition-all cursor-pointer text-left border ${
                  currentStation.id === station.id
                    ? 'bg-[#181818] border-[#ff3e00] text-[#ff3e00]'
                    : 'bg-black border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                }`}
              >
                <span className="truncate">{station.name}</span>
                {station.has3D && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/10 text-white border border-white/20">
                    3D
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
