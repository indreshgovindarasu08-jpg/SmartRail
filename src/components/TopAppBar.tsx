import React from 'react';
import { TabType, UserPreferences } from '../types';
import { SmartRailLogo } from './SmartRailLogo';

interface TopAppBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMenu: () => void;
  stationName?: string;
  subtitle?: string;
  floorSelector?: {
    currentFloor: 'L2' | 'G' | 'L1';
    onSelectFloor: (floor: 'L2' | 'G' | 'L1') => void;
  };
  onBack?: () => void;
  currentUser?: UserPreferences;
  onOpenAuth?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentTab,
  onTabChange,
  isDark,
  onToggleTheme,
  onOpenMenu,
  stationName,
  subtitle,
  floorSelector,
  onBack,
  currentUser,
  onOpenAuth,
}) => {
  // If on map view and back button is provided
  if (currentTab === 'map' && onBack) {
    return (
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-4 md:px-8 h-16 shadow-md transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors text-white active:scale-95 flex items-center justify-center cursor-pointer border border-transparent hover:border-white/20"
            aria-label="Back to stations"
          >
            <span className="material-symbols-outlined text-[#ff3e00]">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-display font-black text-white tracking-tight uppercase truncate max-w-[200px] sm:max-w-[340px]">
              {stationName || 'Coimbatore Junction'}
            </h1>
            <span className="text-[10px] font-bold text-[#ff3e00] uppercase tracking-[0.25em]">
              {subtitle || 'Interactive 3D Digital Twin'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {floorSelector && (
            <div className="flex bg-[#141414] rounded-none border border-white/20 overflow-hidden">
              {(['L2', 'G', 'L1'] as const).map((floor) => (
                <button
                  key={floor}
                  onClick={() => floorSelector.onSelectFloor(floor)}
                  className={`px-3.5 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    floorSelector.currentFloor === floor
                      ? 'bg-white text-black font-black'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {floor}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white active:scale-95 flex items-center justify-center cursor-pointer"
            aria-label="Toggle light/dark mode"
          >
            <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>
      </header>
    );
  }

  // Standard Header (SMARTRAIL or Specific View Header)
  return (
    <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 shadow-md flex items-center justify-between px-4 md:px-8 h-16 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          className="text-white hover:bg-white/10 transition-colors p-2 rounded-lg active:scale-95 flex items-center justify-center cursor-pointer border border-white/10"
          aria-label="Open menu drawer"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div
          onClick={() => onTabChange('explore')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <SmartRailLogo size="sm" />
          <span className="font-display font-black text-xl tracking-tighter text-white uppercase group-hover:text-[#ff3e00] transition-colors">
            SMART<span className="text-[#ff3e00]">RAIL</span>
          </span>
          <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.3em] font-bold px-1.5 py-0.5 border border-[#ff3e00]/50 text-[#ff3e00]">
            TN NAVIGATOR
          </span>
        </div>
      </div>

      {/* Desktop Category Navigation */}
      <nav className="hidden lg:flex items-center space-x-6 text-xs uppercase tracking-widest font-bold text-white/60">
        <button
          onClick={() => onTabChange('explore')}
          className={`hover:text-white transition-colors cursor-pointer pb-1 ${
            currentTab === 'explore' ? 'text-white border-b-2 border-[#ff3e00]' : ''
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onTabChange('train_search')}
          className={`hover:text-white transition-colors cursor-pointer pb-1 flex items-center gap-1 ${
            currentTab === 'train_search' || currentTab === 'train_details'
              ? 'text-[#ff3e00] border-b-2 border-[#ff3e00]'
              : ''
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">train</span>
          <span>Find Train</span>
        </button>
        <button
          onClick={() => onTabChange('map')}
          className={`hover:text-white transition-colors cursor-pointer pb-1 ${
            currentTab === 'map' ? 'text-white border-b-2 border-[#ff3e00]' : ''
          }`}
        >
          3D Station Twin
        </button>
        <button
          onClick={() => onTabChange('my_journey')}
          className={`hover:text-white transition-colors cursor-pointer pb-1 ${
            currentTab === 'my_journey' ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]' : ''
          }`}
        >
          My Journey
        </button>
        <button
          onClick={() => onTabChange('nearby')}
          className={`hover:text-white transition-colors cursor-pointer pb-1 flex items-center gap-1 ${
            currentTab === 'nearby' ? 'text-white border-b-2 border-[#ff3e00]' : ''
          }`}
        >
          Nearby Hubs
        </button>
        <button
          onClick={() => onTabChange('assistant')}
          className={`hover:text-white transition-colors cursor-pointer pb-1 ${
            currentTab === 'assistant' ? 'text-white border-b-2 border-[#ff3e00]' : ''
          }`}
        >
          AI Pilot
        </button>
        <button
          onClick={() => onTabChange('user')}
          className={`hover:text-white transition-colors cursor-pointer pb-1 flex items-center gap-1 ${
            currentTab === 'user' ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]' : ''
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">badge</span>
          <span>User Page</span>
        </button>

        {/* Admin Console Navigation Link - STRICTLY VISIBLE ONLY TO OWNER indreshgovindarasu08@gmail.com */}
        {(currentUser?.email?.toLowerCase() === 'indreshgovindarasu08@gmail.com' || currentUser?.role === 'admin') && (
          <button
            onClick={() => onTabChange('admin')}
            className={`hover:text-white transition-colors cursor-pointer pb-1 flex items-center gap-1 ${
              currentTab === 'admin'
                ? 'text-rose-400 border-b-2 border-rose-500 font-black'
                : 'text-rose-400/80 hover:text-rose-300'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-rose-400">admin_panel_settings</span>
            <span className="text-rose-400 font-bold uppercase tracking-wider">Admin Console</span>
          </button>
        )}
      </nav>

      <div className="flex items-center gap-2">
        {/* Admin Quick Launch Button (Only for indreshgovindarasu08@gmail.com) */}
        {(currentUser?.email?.toLowerCase() === 'indreshgovindarasu08@gmail.com' || currentUser?.role === 'admin') && (
          <button
            onClick={() => onTabChange('admin')}
            className="px-2 py-1 bg-rose-950 border border-rose-500/60 hover:bg-rose-900 text-rose-300 text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            title="Open Admin Control Center (indreshgovindarasu08@gmail.com)"
          >
            <span className="material-symbols-outlined text-[13px] text-rose-400">shield_person</span>
            <span className="hidden sm:inline">Admin Mode</span>
          </button>
        )}
        <button
          id="topbar-find-train-btn"
          onClick={() => onTabChange('train_search')}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-[#ff3e00]/10 hover:bg-[#ff3e00]/20 text-[#ff3e00] text-xs font-mono border border-[#ff3e00]/40 transition-all cursor-pointer font-bold"
          title="Search train and track status"
        >
          <span className="material-symbols-outlined text-[14px]">train</span>
          <span>Live Trains</span>
        </button>

        {/* User Login / Commuter Account Button - Navigates directly to dedicated Login Page */}
        <button
          onClick={() => onTabChange('login')}
          className={`px-2.5 py-1.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border ${
            currentTab === 'login'
              ? 'bg-[#ff3e00] border-[#ff3e00] text-white shadow-md shadow-[#ff3e00]/30 ring-2 ring-[#ff3e00]/50'
              : currentUser?.isLoggedIn
              ? 'bg-[#181818] border-emerald-500/50 text-emerald-400 hover:border-emerald-400'
              : 'bg-[#ff3e00] hover:bg-[#e03700] border-[#ff3e00] text-white shadow-md shadow-[#ff3e00]/20'
          }`}
          title={currentUser?.isLoggedIn ? `Logged in as ${currentUser.name} (Click to open Login / Account Page)` : 'Open Login & Registration Page'}
        >
          {currentUser?.isLoggedIn ? (
            <>
              <span className="w-5 h-5 bg-emerald-500 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                {currentUser.avatar || 'U'}
              </span>
              <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
              <span className="text-[10px] text-white/50 hidden md:inline">• Account</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[15px]">login</span>
              <span>Login / Register</span>
            </>
          )}
        </button>

        <button
          onClick={onToggleTheme}
          className="text-white/70 hover:text-white hover:bg-white/10 transition-colors p-2 rounded-lg active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
            currentTab === 'profile'
              ? 'bg-white text-black border-white'
              : 'border-white/20 text-white hover:border-[#ff3e00] hover:text-[#ff3e00]'
          }`}
          aria-label="User Profile"
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
};
